"""
Read-only service that builds a compact summary of product decision history.

All analysis is deterministic SQL aggregation — no AI calls.
Safe to call at any time without side effects.
"""
import logging
from typing import Any

log = logging.getLogger(__name__)

_ACCEPTED = ("REVIEWED", "QUEUED", "LIVE")
_REJECTED = "REJECTED"


async def build_summary(db) -> dict[str, Any]:
    """
    Query the products and pipeline_products tables and return a compact
    decision-history summary dict.  All keys are always present; empty
    sub-lists mean not enough data yet.
    """

    # ── 1. Overall counts ──────────────────────────────────────────────────────
    totals = await db.fetchrow("""
        SELECT
            COUNT(*) FILTER (WHERE stage IN ('REVIEWED','QUEUED','LIVE')) AS accepted,
            COUNT(*) FILTER (WHERE stage = 'REJECTED')                    AS rejected,
            COUNT(*) FILTER (WHERE stage = 'SCRAPED')                     AS pending,
            COUNT(*) FILTER (WHERE stage = 'ENRICHED')                    AS enriched
        FROM products
    """)
    totals = dict(totals) if totals else {"accepted": 0, "rejected": 0, "pending": 0, "enriched": 0}

    # ── 2. Score / margin stats by ACCEPTED vs REJECTED ────────────────────────
    outcome_stats = await db.fetch("""
        SELECT
            CASE
                WHEN stage IN ('REVIEWED','QUEUED','LIVE') THEN 'ACCEPTED'
                ELSE 'REJECTED'
            END                                        AS outcome,
            COUNT(*)                                   AS cnt,
            ROUND(AVG(score)::numeric, 2)              AS avg_score,
            ROUND(MIN(score)::numeric, 2)              AS min_score,
            ROUND(MAX(score)::numeric, 2)              AS max_score,
            ROUND(AVG(niche_fit)::numeric, 2)          AS avg_niche_fit,
            ROUND(MIN(niche_fit)::numeric, 2)          AS min_niche_fit,
            ROUND(AVG(visual_appeal)::numeric, 2)      AS avg_visual,
            ROUND(AVG(margin_pct)::numeric, 1)         AS avg_margin,
            ROUND(MIN(margin_pct)::numeric, 1)         AS min_margin,
            ROUND(MAX(margin_pct)::numeric, 1)         AS max_margin
        FROM products
        WHERE stage IN ('REVIEWED','QUEUED','LIVE','REJECTED')
          AND score IS NOT NULL
        GROUP BY outcome
    """)

    # ── 3. Category-level acceptance rates ─────────────────────────────────────
    categories = await db.fetch("""
        SELECT
            category,
            COUNT(*)                                                                AS total,
            COUNT(*) FILTER (WHERE stage IN ('REVIEWED','QUEUED','LIVE'))           AS accepted,
            COUNT(*) FILTER (WHERE stage = 'REJECTED')                             AS rejected,
            ROUND(AVG(score)::numeric, 2)                                          AS avg_score,
            ROUND(AVG(niche_fit)::numeric, 2)                                      AS avg_niche_fit
        FROM products
        WHERE category IS NOT NULL AND category != ''
          AND stage IN ('REVIEWED','QUEUED','LIVE','REJECTED')
        GROUP BY category
        ORDER BY total DESC
        LIMIT 25
    """)

    # ── 4. Keyword-level acceptance rates ──────────────────────────────────────
    keywords = await db.fetch("""
        SELECT
            keyword,
            COUNT(*)                                                                AS total,
            COUNT(*) FILTER (WHERE stage IN ('REVIEWED','QUEUED','LIVE'))           AS accepted,
            COUNT(*) FILTER (WHERE stage = 'REJECTED')                             AS rejected,
            ROUND(AVG(score)::numeric, 2)                                          AS avg_score
        FROM products
        WHERE keyword IS NOT NULL AND keyword != ''
          AND stage IN ('REVIEWED','QUEUED','LIVE','REJECTED')
        GROUP BY keyword
        ORDER BY total DESC
        LIMIT 25
    """)

    # ── 5. Top rejection reasons ───────────────────────────────────────────────
    rejection_reasons = await db.fetch("""
        SELECT rejection_reason, COUNT(*) AS cnt
        FROM products
        WHERE stage = 'REJECTED'
          AND rejection_reason IS NOT NULL AND rejection_reason != ''
        GROUP BY rejection_reason
        ORDER BY cnt DESC
        LIMIT 20
    """)

    # ── 6. High-score products that were rejected (score >= 7.5) ──────────────
    # These are candidates for AI overconfidence or filter miscalibration.
    high_score_rejected = await db.fetch("""
        SELECT id, title_translated, category, score, niche_fit, visual_appeal,
               rejection_reason, keyword, margin_pct, orders
        FROM products
        WHERE stage = 'REJECTED'
          AND score >= 7.5
        ORDER BY score DESC
        LIMIT 30
    """)

    # ── 7. Accepted products with low AI score (score < 7.0) ──────────────────
    # These indicate you approved something the AI undervalued.
    low_score_accepted = await db.fetch("""
        SELECT id, title_translated, category, score, niche_fit, visual_appeal,
               keyword, margin_pct, orders
        FROM products
        WHERE stage IN ('REVIEWED','QUEUED','LIVE')
          AND score IS NOT NULL AND score < 7.0
        ORDER BY score ASC
        LIMIT 20
    """)

    # ── 8. Pipeline filter stage breakdown ─────────────────────────────────────
    # Shows which filter rule is responsible for how many rejections.
    pipeline_breakdown = await db.fetch("""
        SELECT filter_stage, filter_reason, COUNT(*) AS cnt
        FROM pipeline_products
        WHERE filter_stage IS NOT NULL
        GROUP BY filter_stage, filter_reason
        ORDER BY cnt DESC
        LIMIT 30
    """)

    # ── 9. Margin bucket distribution: accepted vs rejected ────────────────────
    margin_buckets = await db.fetch("""
        SELECT
            CASE
                WHEN margin_pct >= 80 THEN '80+'
                WHEN margin_pct >= 70 THEN '70-80'
                WHEN margin_pct >= 60 THEN '60-70'
                WHEN margin_pct >= 50 THEN '50-60'
                WHEN margin_pct >= 40 THEN '40-50'
                ELSE 'under-40'
            END                                                                     AS bucket,
            COUNT(*) FILTER (WHERE stage IN ('REVIEWED','QUEUED','LIVE'))           AS accepted,
            COUNT(*) FILTER (WHERE stage = 'REJECTED')                             AS rejected
        FROM products
        WHERE margin_pct IS NOT NULL
          AND stage IN ('REVIEWED','QUEUED','LIVE','REJECTED')
        GROUP BY bucket
        ORDER BY bucket DESC
    """)

    # ── 10. AI provider split for accepted vs rejected ─────────────────────────
    provider_stats = await db.fetch("""
        SELECT
            ai_provider,
            COUNT(*) FILTER (WHERE stage IN ('REVIEWED','QUEUED','LIVE'))  AS accepted,
            COUNT(*) FILTER (WHERE stage = 'REJECTED')                     AS rejected
        FROM products
        WHERE ai_provider IS NOT NULL AND ai_provider != ''
          AND stage IN ('REVIEWED','QUEUED','LIVE','REJECTED')
        GROUP BY ai_provider
    """)

    return {
        "totals": totals,
        "outcome_stats": [
            {
                "outcome": r["outcome"],
                "cnt": r["cnt"],
                "avg_score": float(r["avg_score"]) if r["avg_score"] is not None else None,
                "min_score": float(r["min_score"]) if r["min_score"] is not None else None,
                "max_score": float(r["max_score"]) if r["max_score"] is not None else None,
                "avg_niche_fit": float(r["avg_niche_fit"]) if r["avg_niche_fit"] is not None else None,
                "min_niche_fit": float(r["min_niche_fit"]) if r["min_niche_fit"] is not None else None,
                "avg_visual": float(r["avg_visual"]) if r["avg_visual"] is not None else None,
                "avg_margin": float(r["avg_margin"]) if r["avg_margin"] is not None else None,
                "min_margin": float(r["min_margin"]) if r["min_margin"] is not None else None,
                "max_margin": float(r["max_margin"]) if r["max_margin"] is not None else None,
            }
            for r in outcome_stats
        ],
        "categories": [
            {
                "category": r["category"],
                "total": r["total"],
                "accepted": r["accepted"],
                "rejected": r["rejected"],
                "acceptance_rate": round(r["accepted"] / r["total"] * 100, 1) if r["total"] else 0.0,
                "avg_score": float(r["avg_score"]) if r["avg_score"] is not None else None,
                "avg_niche_fit": float(r["avg_niche_fit"]) if r["avg_niche_fit"] is not None else None,
            }
            for r in categories
        ],
        "keywords": [
            {
                "keyword": r["keyword"],
                "total": r["total"],
                "accepted": r["accepted"],
                "rejected": r["rejected"],
                "acceptance_rate": round(r["accepted"] / r["total"] * 100, 1) if r["total"] else 0.0,
                "avg_score": float(r["avg_score"]) if r["avg_score"] is not None else None,
            }
            for r in keywords
        ],
        "rejection_reasons": [
            {"reason": r["rejection_reason"], "cnt": r["cnt"]}
            for r in rejection_reasons
        ],
        "high_score_rejected": [
            {
                "id": r["id"],
                "title": (r["title_translated"] or "")[:70],
                "category": r["category"],
                "score": r["score"],
                "niche_fit": r["niche_fit"],
                "visual_appeal": r["visual_appeal"],
                "rejection_reason": r["rejection_reason"],
                "keyword": r["keyword"],
                "margin_pct": r["margin_pct"],
                "orders": r["orders"],
            }
            for r in high_score_rejected
        ],
        "low_score_accepted": [
            {
                "id": r["id"],
                "title": (r["title_translated"] or "")[:70],
                "category": r["category"],
                "score": r["score"],
                "niche_fit": r["niche_fit"],
                "visual_appeal": r["visual_appeal"],
                "keyword": r["keyword"],
                "margin_pct": r["margin_pct"],
                "orders": r["orders"],
            }
            for r in low_score_accepted
        ],
        "pipeline_breakdown": [
            {
                "filter_stage": r["filter_stage"],
                "filter_reason": r["filter_reason"],
                "cnt": r["cnt"],
            }
            for r in pipeline_breakdown
        ],
        "margin_buckets": [
            {
                "bucket": r["bucket"],
                "accepted": r["accepted"],
                "rejected": r["rejected"],
            }
            for r in margin_buckets
        ],
        "provider_stats": [
            {
                "provider": r["ai_provider"],
                "accepted": r["accepted"],
                "rejected": r["rejected"],
            }
            for r in provider_stats
        ],
    }


# Hard cap: snippet must never exceed this many lines so token cost stays bounded.
_SNIPPET_MAX_LINES = 12


def build_context_snippet(summary: dict) -> str | None:
    """
    Convert a build_summary() result into a compact, bounded plain-text block
    suitable for appending to a Gemini system prompt.

    Returns None when there is not enough data to produce meaningful context
    (fewer than 10 total decisions).  The caller must treat None as "no injection."

    Design constraints:
    - Pure function — no IO, no AI, no side effects.
    - Output is capped at _SNIPPET_MAX_LINES lines (~150-200 tokens).
    - Never includes raw product titles, IDs, or per-product records.
    - Only aggregate statistics: counts, averages, rates, top-N lists.
    """
    totals = summary.get("totals", {})
    accepted = int(totals.get("accepted", 0))
    rejected = int(totals.get("rejected", 0))
    total = accepted + rejected

    if total < 10:
        return None

    lines: list[str] = ["=== Store Preference Context (do not alter scoring weights) ==="]

    # Line 1 — decision volume and acceptance rate
    rate = round(accepted / total * 100, 1) if total else 0.0
    lines.append(f"History: {accepted} accepted, {rejected} rejected ({rate}% acceptance rate)")

    # Lines 2-3 — score profile comparison
    outcome_map = {r["outcome"]: r for r in summary.get("outcome_stats", [])}
    acc_stats = outcome_map.get("ACCEPTED")
    rej_stats = outcome_map.get("REJECTED")

    if acc_stats and acc_stats.get("avg_score") is not None:
        lines.append(
            f"Accepted avg: score {acc_stats['avg_score']:.1f} | "
            f"niche_fit {acc_stats['avg_niche_fit']:.1f} | "
            f"visual {acc_stats['avg_visual']:.1f} | "
            f"margin {acc_stats['avg_margin']:.0f}%"
        )
    if rej_stats and rej_stats.get("avg_score") is not None:
        lines.append(
            f"Rejected avg: score {rej_stats['avg_score']:.1f} | "
            f"niche_fit {rej_stats['avg_niche_fit']:.1f} | "
            f"visual {rej_stats['avg_visual']:.1f}"
        )

    # Lines 4-5 — top accepted categories (acceptance rate >= 20%, at least 3 accepted)
    categories = summary.get("categories", [])
    top_accepted = [
        c for c in categories
        if c["accepted"] >= 3 and c["acceptance_rate"] >= 20.0
    ][:3]
    if top_accepted:
        cat_str = ", ".join(
            f"{c['category']} ({c['acceptance_rate']:.0f}%)" for c in top_accepted
        )
        lines.append(f"Strong categories: {cat_str}")

    # Line 6 — zero-acceptance categories (at least 8 products, 0% rate)
    zero_cats = [
        c["category"] for c in categories
        if c["total"] >= 8 and c["acceptance_rate"] == 0.0
    ][:4]
    if zero_cats:
        lines.append(f"Consistently rejected categories: {', '.join(zero_cats)}")

    # Lines 7-8 — top rejection patterns
    reasons = summary.get("rejection_reasons", [])
    top_reasons = reasons[:3]
    if top_reasons:
        reason_total = sum(r["cnt"] for r in reasons) or 1
        reason_str = " | ".join(
            f"{r['reason'][:40]} ({round(r['cnt'] / reason_total * 100)}%)"
            for r in top_reasons
        )
        lines.append(f"Common rejection patterns: {reason_str}")

    # Line 9 — low-score products you accepted (signal that AI undervalues something)
    low_accepted = summary.get("low_score_accepted", [])
    if len(low_accepted) >= 3:
        avg_low = sum(p["score"] for p in low_accepted if p.get("score")) / len(low_accepted)
        lines.append(
            f"Note: {len(low_accepted)} products with score < 7.0 were accepted "
            f"(avg {avg_low:.1f}) — some product types may score conservatively."
        )

    lines.append("=== End Context ===")

    # Hard cap: truncate to _SNIPPET_MAX_LINES and rejoin
    if len(lines) > _SNIPPET_MAX_LINES:
        lines = lines[:_SNIPPET_MAX_LINES - 1] + ["=== End Context ==="]

    return "\n".join(lines)
