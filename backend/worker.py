"""
Worker Service (DropOS)
----------------------
Handles the background processing pipeline for products.

"Blast Shield" pattern: the outermost try/except in each loop catches ALL
unexpected exceptions. On failure the loop logs the error, sleeps for
_ERROR_SLEEP seconds, then continues — so a bad product or API outage can
never permanently kill the background process.
"""

import asyncio
import logging
import json
from datetime import datetime, timezone

# ── Absolute imports (backend/ is on sys.path, NOT a package) ─────────────────
from database import db
from models import ProductStage          # NOT from main — that causes a circular import
from services.images import process_image
from services.publisher import publish_to_instagram
import decision_memory


log = logging.getLogger(__name__)

# How long to pause after an unexpected crash before retrying
_ERROR_SLEEP = 60
# Batch size for Vision AI collage; must match collage.py COLS*ROWS (2A-3 = 6)
_BATCH_SIZE = 6


async def run_worker_loop():
    """
    Continuously processes SCRAPED products in batches of 6.

    Pipeline per batch:
      1. Batch Vision AI via Gemini collage (The Curator)
      2. Deep text enrichment for winners (gpt-4o-mini caption)
      3. Image download + Supabase upload for winners
      4. DB update → ENRICHED  (winners) / REJECTED (losers)
    """
    log.info("Started autonomous worker loop (Batch Vision + Deep Enrichment).")

    while True:
        try:
            # ── Poll for SCRAPED products ─────────────────────────────────────
            products = await db.get_products(
                stage=ProductStage.SCRAPED.value,
                limit=_BATCH_SIZE,
                sort="created",
            )

            if not products:
                await asyncio.sleep(10)
                continue

            settings = await db.get_settings()
            log.info("Worker: Running Batch Vision AI for %d products...", len(products))

            # ── Decision-memory context injection (feature flag: ai_context_injection) ──
            # When OFF (default): context_snippet=None → Gemini call is byte-for-byte
            # identical to the pre-Phase-2 baseline.
            # When ON: a compact aggregate summary is appended to the system prompt.
            # Built once per batch iteration — one DB read, not one per product.
            flag_on: bool = bool(settings.get("ai_context_injection"))
            context_snippet: str | None = None
            skip_reason: str | None = None   # recorded in enrichment_log

            if flag_on:
                try:
                    summary = await decision_memory.build_summary(db)
                    context_snippet = decision_memory.build_context_snippet(summary)
                    if context_snippet:
                        log.debug("Worker: injecting decision-memory context (%d chars)", len(context_snippet))
                    else:
                        skip_reason = "insufficient_history"
                        log.debug("Worker: ai_context_injection ON but insufficient history — skipping")
                except Exception as exc:
                    skip_reason = "error"
                    # Never let a failed context build block enrichment.
                    log.warning("Worker: decision-memory context build failed (%s) — proceeding without it", exc)
                    context_snippet = None
            else:
                skip_reason = "flag_off"

            # Deferred import avoids circular dependency at module load time
            from enrichment import ai_enrich_batch
            batch_results = await ai_enrich_batch(products, settings, context_snippet)

            for i, p in enumerate(products):
                pid = p["id"]
                source_id = p.get("source_id", str(pid))

                # Guard: truncated AI response
                if i >= len(batch_results):
                    log.warning("Worker: Missing AI result for pid=%d, rejecting.", pid)
                    await db.update_product_fields(pid, {
                        "stage": "REJECTED",
                        "rejection_reason": "Curator: No AI result returned",
                    })
                    continue

                res = batch_results[i]

                verdict     = res.get("verdict", "auto_reject")
                composite_s = float(res.get("composite_score") or res.get("score") or 0)

                # pending_review products (≥6.0) go to review queue, not hard reject
                store_match = res.get("store_match") or verdict in (
                    "top_priority", "strong_candidate", "pending_review"
                )

                if not store_match:
                    # ── Hard rejection (auto_reject verdict or composite < 6.0) ─
                    reason = res.get("rejection_reason", "Score below threshold")
                    await db.update_product_fields(pid, {
                        "stage":            "REJECTED",
                        "rejection_reason": f"Curator: {reason}",
                        # save real scores so UI shows why it was rejected
                        "composite_score":  composite_s,
                        "verdict":          verdict,
                        "score":            composite_s,
                    })
                    log.info("Worker: [REJECT] pid=%d score=%.2f verdict=%s → %s",
                             pid, composite_s, verdict, reason[:60])
                    continue

                # ── Winner: Deep Enrichment + Supabase Image Upload ───────────
                log.info("Worker: [WINNER] Deep Enrichment for pid=%d...", pid)
                title = p.get("title_translated") or p.get("product_name") or p.get("title") or ""
                description = p.get("description_translated") or p.get("description") or ""

                # b. Download + compress + upload to Supabase Storage
                images = p.get("images") or []
                raw_image_url = images[0] if images else p.get("image_url", "")

                try:
                    new_image_url = await process_image(raw_image_url, source_id=source_id)
                    if new_image_url and new_image_url != raw_image_url:
                        log.info("Worker: Image uploaded to Supabase for pid=%d", pid)
                    else:
                        log.warning("Worker: Falling back to original URL for pid=%d", pid)
                except Exception as e:
                    log.error("Worker: Image pipeline failed for pid=%d: %s — using original URL", pid, e)
                    new_image_url = raw_image_url

                # c. Persist everything in one DB update
                updates = {
                    "caption":         res.get("caption") or p.get("caption") or "",
                    "hashtags_json":   json.dumps(res.get("hashtags") or p.get("hashtags") or []),
                    "product_name":    res.get("product_name") or p.get("product_name", ""),
                    "audience":        res.get("audience") or "",
                    "stage":           ProductStage.ENRICHED.value,
                    # scoring fields — allowlist gate opened in database.py
                    "score":           float(res.get("composite_score") or res.get("score") or 0),
                    "niche_fit":       float(res.get("niche_fit") or 0),
                    "visual_appeal":   float(res.get("visual_appeal") or 0),
                    "trend_score":     float(res.get("trend_score") or 0),
                    "composite_score": float(res.get("composite_score") or 0),
                    "verdict":         res.get("verdict") or "",
                    "product_tier":    res.get("product_tier") or "",
                    "confidence":      float(res.get("confidence") or 0),
                    "viral_angle":     res.get("viral_angle") or "",
                    "emotional_hook":  res.get("emotional_hook") or "",
                }

                if new_image_url and images:
                    try:
                        images[0] = new_image_url
                        updates["images_json"] = json.dumps(images)
                    except Exception as e:
                        log.warning("Worker: Failed to update images array for pid=%d: %s", pid, e)

                await db.update_product_fields(pid, updates)
                log.info("Worker: pid=%d → ENRICHED.", pid)

            # ── Observability: log batch metadata for injection comparison ─────
            # Fire-and-forget — a write failure must never block the worker loop.
            try:
                scores = [
                    r["score"] for r in batch_results
                    if isinstance(r.get("score"), (int, float))
                ]
                await db.log_enrichment_batch({
                    "flag_on":          int(flag_on),
                    "snippet_injected": int(bool(context_snippet)),
                    "snippet_length":   len(context_snippet) if context_snippet else 0,
                    "skip_reason":      skip_reason,
                    "batch_size":       len(products),
                    "accepted_count":   sum(1 for r in batch_results if r.get("store_match")),
                    "rejected_count":   sum(1 for r in batch_results if not r.get("store_match")),
                    "avg_score":        round(sum(scores) / len(scores), 2) if scores else None,
                })
            except Exception as exc:
                log.warning("Worker: enrichment_log write failed (%s) — non-critical", exc)

            # Brief pause before next batch
            await asyncio.sleep(2)

        except asyncio.CancelledError:
            log.info("Autonomous worker loop cancelled.")
            break
        except Exception as e:
            # ── Blast Shield ──────────────────────────────────────────────────
            log.error(
                "Critical Worker Error (will retry in %ds): %s",
                _ERROR_SLEEP, e, exc_info=True,
            )
            await asyncio.sleep(_ERROR_SLEEP)


async def process_queued_items():
    """
    Continuously publishes QUEUED products to Instagram.
    Polls every 60 s when idle, 5 s when actively draining the queue.
    """
    log.info("Started queued items publisher loop.")

    while True:
        try:
            products = await db.get_products(
                stage=ProductStage.QUEUED.value,
                limit=5,
                sort="created",
            )

            for p in products:
                pid = p["id"]

                images = p.get("images") or []
                image_url = images[0] if images else p.get("image_url", "")

                caption = p.get("caption", "")
                hashtags = p.get("hashtags") or []
                if hashtags:
                    caption += "\n\n" + " ".join(hashtags)

                log.info("Publisher: Publishing pid=%d...", pid)
                try:
                    ig_url = await publish_to_instagram(image_url, caption)
                    await db.update_product_fields(pid, {
                        "stage": ProductStage.LIVE.value,
                        "instagram_url": ig_url,
                        "posted_at": datetime.now(timezone.utc).isoformat()
                    })
                    log.info("Publisher: pid=%d → LIVE (URL: %s).", pid, ig_url)
                except Exception as e:
                    log.error("Publisher: Failed to publish pid=%d: %s", pid, e)

            await asyncio.sleep(60 if not products else 5)

        except asyncio.CancelledError:
            log.info("Publisher loop cancelled.")
            break
        except Exception as e:
            # ── Blast Shield ──────────────────────────────────────────────────
            log.error(
                "Critical Publisher Error (will retry in %ds): %s",
                _ERROR_SLEEP, e, exc_info=True,
            )
            await asyncio.sleep(_ERROR_SLEEP)
