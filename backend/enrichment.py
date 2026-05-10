"""
AI enrichment layer — DropOS.

Pipeline (in priority order):
  1. Gemini 2.5 Flash-Lite  (gemini_key set) — image + text analysis  ★ PRIMARY
  2. Groq Llama 3.3 70B     (groq_key set)   — text-only fallback, 14 400 RPD free
  3. Mock rule-based         (no keys)        — deterministic, always free

NOTE: Groq is TEXT-ONLY — it cannot see product images.
      Always configure a Gemini key for real image-based scoring.
"""

import asyncio
import base64
import json
import logging
import random
import re
from typing import Optional

import httpx

from config.runtime import get_config
from collage import create_collage

log = logging.getLogger(__name__)

_AI_SEMAPHORE: Optional[asyncio.Semaphore] = None
_GEMINI_QUOTA_EXHAUSTED = False


def _get_semaphore() -> asyncio.Semaphore:
    global _AI_SEMAPHORE
    if _AI_SEMAPHORE is None:
        _AI_SEMAPHORE = asyncio.Semaphore(2)
    return _AI_SEMAPHORE


# ── Prompts ────────────────────────────────────────────────────────────────────

_GEMINI_SYSTEM = """
You are a Senior Product Analyst for "წყვილი" — a viral couples ecommerce brand targeting Gen Z and young adults aged 16-24.
You will be shown a COLLAGE of 2-6 products arranged in a grid.
- Row 1: Left=Prod 1, Right=Prod 2
- Row 2: Left=Prod 3, Right=Prod 4
- Row 3: Left=Prod 5, Right=Prod 6

The store sells emotionally resonant, impulse-buyable, shareable products: jewelry, matching items, bedroom decor, cute accessories, personalized gifts, TikTok-style trending products, kawaii items, Y2K aesthetics, long-distance gifts, cozy couple items.

Your mission: find products with the highest probability of becoming emotionally viral, impulse-purchased, and shareable on TikTok, Instagram Reels, and Pinterest.

═══ HARD REJECT RULES — evaluate BEFORE scoring ═══
Immediately set verdict="auto_reject" and store_match=false if ANY rule triggers:
1. B2B / INDUSTRIAL: wholesale, factory, bulk, OEM, machine parts, automotive, plumbing, electrical components
2. EMOTIONALLY DEAD + NO COUPLE ANGLE: zero romantic/aesthetic/emotional application AND no creative reframe possible
3. WRONG DEMOGRAPHIC: clearly targets 35+ professionals, children under 12, or elderly with no youth aesthetic crossover
4. IMPOSSIBLE COUPLE ANGLE: products where relationship framing requires absurd creative stretch (engine oil, medical devices, garden hoses)
5. VISUALLY UNREDEEMABLE: product looks like a stock photo reject — blurry, grey background wholesale listing with no lifestyle appeal

═══ PRODUCT TIER — classify before scoring ═══
TIER 1 — CORE COUPLE: inherently designed for couples or romance. No reframing needed.
Examples: matching jewelry, couple keychains, love letters, anniversary keepsakes, his & hers sets, long-distance touch lamps, promise rings, couple photo frames, heart lockets.

TIER 2 — VIRAL ADJACENT: not inherently couple-specific but EASILY activated with a relationship/emotional angle.
Examples: neon signs, star projectors, cozy plushies, aesthetic candles, cute LED lights, kawaii accessories, Y2K jewelry, aesthetic phone cases, Polaroid cameras, mood lamps, matching hoodies, cute mugs.
IMPORTANT: Do NOT reject Tier 2 just because it's not labeled "couple." If it has viral potential + emotional resonance that a couple TikTok creator could activate — PASS IT.

═══ SCORING DIMENSIONS — all 1-10 ═══
A. emotional_trigger (weight 0.25): Does it create feelings of love, attachment, intimacy, or relationship identity? Could someone buy it to express affection without words? 10 = instant "I need this for us" reaction.
B. viral_potential (weight 0.20): Would this perform in short-form video? Does it have satisfying visuals, glow, transformation, animation, reveal, or personalization moment? 10 = built for TikTok.
C. giftability (weight 0.20): Easy to gift for birthdays, anniversaries, Valentine's Day, or "just because"? Impulse-giftable for a 16-24 year old on a student budget? 10 = perfect gift, instant yes.
D. aesthetic_fit (weight 0.15): Matches Gen Z visual preferences — soft/pastel, black luxury, kawaii, Y2K, cozy, romantic, minimalist, TikTok-core? 10 = born for a couple aesthetic feed.
E. impulse_score (weight 0.15): Can someone buy this within 5-15 seconds of seeing it? Is the wow factor immediate? 10 = instant impulse purchase.
F. audience_fit (weight 0.05): How well does it fit the 16-24 couple demographic specifically? 10 = made for young couples.

═══ COMPOSITE SCORE FORMULA ═══
composite = (emotional_trigger*0.25) + (viral_potential*0.20) + (giftability*0.20) + (aesthetic_fit*0.15) + (impulse_score*0.15) + (audience_fit*0.05)

═══ VERDICT THRESHOLDS ═══
top_priority:     composite >= 8.0 AND emotional_trigger >= 8
strong_candidate: composite >= 6.5 AND emotional_trigger >= 6
pending_review:   composite >= 5.0
auto_reject:      composite < 5.0 OR hard reject rule triggered

store_match = true ONLY IF verdict in ["top_priority", "strong_candidate"]

═══ TREND-ADJACENT BONUS ═══
If the product is Tier 2 (viral adjacent) AND has clear TikTok/viral visual potential, apply a +0.5 mental boost to composite before thresholding. Do not penalize for being non-traditional — evaluate as if marketed to a young couple audience.

═══ OUTPUT — JSON only, no markdown ═══
Return {"results": [...]} with one object per product in collage order.
Each object must include ALL of these fields:
{
  "product_index": 1,
  "product_tier": "core_couple" | "viral_adjacent" | "rejected",
  "composite_score": 7.4,
  "scores": {
    "emotional_trigger": 8,
    "viral_potential": 7,
    "giftability": 8,
    "aesthetic_fit": 7,
    "impulse_score": 7,
    "audience_fit": 8
  },
  "confidence": 0.80,
  "verdict": "strong_candidate",
  "store_match": true,
  "viral_angle": "POV: getting this for your girlfriend — one sentence TikTok hook",
  "emotional_hook": "one sentence describing the emotional trigger",
  "content_hooks": ["reaction video", "unboxing", "couple challenge"],
  "rejection_reason": "",
  "product_name": "Georgian name 3-5 words (only if store_match=true)",
  "caption": "Georgian caption 2-3 sentences (only if store_match=true)",
  "hashtags": []
}
"""

_GROQ_SYSTEM = """
You are a Senior Product Analyst for "წყვილი" — a viral couples ecommerce brand targeting Gen Z and young adults aged 16-24.
NOTE: TEXT-ONLY analysis — no image access. Score visual dimensions conservatively.

The store sells emotionally resonant, impulse-buyable, shareable products: jewelry, matching items, bedroom decor, cute accessories, personalized gifts, TikTok-style trending products, kawaii items, Y2K aesthetics, long-distance gifts.

HARD REJECT: B2B/industrial/wholesale signals, zero emotional angle with no couple reframe possible, clearly wrong demographic (under 12 / over 35 professionals), impossible couple angle.

PRODUCT TIERS:
- core_couple: inherently couple/romance products (matching jewelry, love gifts, anniversary items)
- viral_adjacent: not couple-specific but activatable with emotional/relationship angle (neon signs, star projectors, plushies, aesthetic candles, kawaii items, Y2K accessories)
- rejected: hard reject triggered

SCORING DIMENSIONS (1-10):
- emotional_trigger (0.25): Love, attachment, intimacy, relationship identity
- viral_potential (0.20): TikTok/Reels performance potential, visual wow
- giftability (0.20): Easy impulse gift for 16-24 year olds
- aesthetic_fit (0.15): Gen Z visual preferences — kawaii, Y2K, cozy, minimalist, romantic
- impulse_score (0.15): Buy within 5-15 seconds of seeing it
- audience_fit (0.05): Fit for 16-24 young couples

composite = (emotional_trigger*0.25) + (viral_potential*0.20) + (giftability*0.20) + (aesthetic_fit*0.15) + (impulse_score*0.15) + (audience_fit*0.05)

VERDICT THRESHOLDS:
top_priority:     composite >= 8.0 AND emotional_trigger >= 8
strong_candidate: composite >= 6.5 AND emotional_trigger >= 6
pending_review:   composite >= 5.0
auto_reject:      composite < 5.0 OR hard reject triggered

store_match = true ONLY IF verdict in ["top_priority", "strong_candidate"]

OUTPUT: JSON only, no markdown.
Fields: product_tier, composite_score, scores (object with 6 sub-scores), confidence, verdict, store_match, viral_angle, emotional_hook, content_hooks (array), rejection_reason, product_name (Georgian 3-5 words if passed), caption (Georgian 2-3 sentences if passed), hashtags (array).
"""

# ── Audience inference ─────────────────────────────────────────────────────────

_MALE_WORDS   = {"men","male","boy","beard","shaving","suit","tie","cufflink","wallet"}
_FEMALE_WORDS = {"women","female","girl","makeup","lipstick","handbag","purse","dress",
                 "skirt","blush","mascara","foundation"}
_KIDS_WORDS   = {"baby","kid","child","children","toy","toddler","infant","nursery"}


def infer_audience(product: dict) -> str:
    title = (product.get("title_translated") or product.get("title", "")).lower()
    if any(w in title for w in _KIDS_WORDS):   return "kids"
    if any(w in title for w in _FEMALE_WORDS): return "female"
    if any(w in title for w in _MALE_WORDS):   return "male"
    return "unisex"


# ── Tag generation ─────────────────────────────────────────────────────────────

_CATEGORY_TAGS: dict = {
    "Jewelry":           ["couplejewelry","matchingjewelry","giftforher","giftforhim","romanticgift"],
    "Accessories":       ["couplegift","relationshipgoals","giftideas","anniversary","lovegift"],
    "Home Decor":        ["couplegoals","romanticdecor","lovehomedecor","couplenesting","giftforhome"],
    "Home":              ["couplelife","hometogetherr","couplenesting","giftforhome","newcouple"],
    "Stationery":        ["lovenotes","couplejournal","romanticgift","giftforpartner","anniversarygift"],
    "Bags":              ["giftforher","coupleaccessories","romanticgift","lovegift","giftideas"],
    "Home Fragrance":    ["romanceathome","couplecandle","selfcaretogether","coupletime","romanticevening"],
    "Phone Accessories": ["couplematch","matchingphonecase","coupleaesthetic","relationshipgoals","giftforhim"],
    "Phone Cases":       ["matchingcases","couplematch","coupleaesthetic","giftforboyfriend","giftforgirlfriend"],
    "Electronics":       ["giftforhim","giftforboyfriend","coupletech","romanticgift","anniversarygift"],
}
_UNIVERSAL_TAGS = ["couplegoals","relationshipgoals","giftforhim","giftforher",
                   "anniversarygift","valentinesday","couplelife","lovegift"]


def _get_tags(product: dict) -> list:
    category = product.get("category", "")
    base = _CATEGORY_TAGS.get(category, ["aesthetic","lifestyle","trending"])
    return list(dict.fromkeys(base + _UNIVERSAL_TAGS))[:15]


def _clean_name(product: dict) -> str:
    title = product.get("title_translated") or product.get("title", "Product")
    return " ".join(title.split()[:5])


def _build_system_text(context_snippet: str | None) -> str:
    """
    Return the system prompt text for a Gemini call.

    When context_snippet is None (flag OFF or no data): returns the base prompt
    unchanged — behavior is identical to the pre-Phase-2 baseline.

    When context_snippet is a non-empty string (flag ON, enough history):
    appends it as a clearly delimited addendum.  The base curation rules and
    scoring weights are never modified.
    """
    if not context_snippet:
        return _GEMINI_SYSTEM
    return f"{_GEMINI_SYSTEM}\n{context_snippet}"


# ── Shared normalization ───────────────────────────────────────────────────────

def _normalize_enrichment(result: dict, product: dict, provider: str) -> dict:
    """
    Coerce an AI response into the canonical enrichment schema.

    Handles both the new schema (composite_score + scores sub-object) and the
    legacy schema (score + niche_fit + visual_appeal + trend_score) so that
    old Groq/mock responses still work during a rolling deployment.
    """
    # ── Derive composite_score ─────────────────────────────────────────────────
    if "composite_score" not in result:
        # Legacy schema: reconstruct composite from old fields
        niche  = float(result.get("niche_fit", 0))
        visual = float(result.get("visual_appeal", 0))
        trend  = float(result.get("trend_score", 0))
        result["composite_score"] = round(niche * 0.50 + visual * 0.30 + trend * 0.20, 2)

    composite = float(result.get("composite_score", 0))

    # ── Ensure scores sub-object exists ───────────────────────────────────────
    if "scores" not in result:
        niche  = float(result.get("niche_fit", 0))
        visual = float(result.get("visual_appeal", 0))
        trend  = float(result.get("trend_score", 0))
        # When no legacy sub-scores exist either, use composite * 0.9 as a
        # conservative floor — avoids inflating emotional_trigger to composite
        # which would incorrectly promote pending_review products to top_priority.
        fallback = round(composite * 0.9, 1) if composite else 0.0
        result["scores"] = {
            "emotional_trigger": round(niche, 1) if niche else fallback,
            "viral_potential":   round(trend, 1) if trend else fallback,
            "giftability":       round(niche * 0.9, 1) if niche else fallback,
            "aesthetic_fit":     round(visual, 1) if visual else fallback,
            "impulse_score":     round(trend * 0.9, 1) if trend else fallback,
            "audience_fit":      round(niche * 0.85, 1) if niche else fallback,
        }

    emotional = float(result["scores"].get("emotional_trigger", 0))

    # ── Derive verdict ─────────────────────────────────────────────────────────
    if "verdict" not in result:
        if composite >= 8.0 and emotional >= 8:
            verdict = "top_priority"
        elif composite >= 6.5 and emotional >= 6:
            verdict = "strong_candidate"
        elif composite >= 5.0:
            verdict = "pending_review"
        else:
            verdict = "auto_reject"
        result["verdict"] = verdict

    # ── Derive store_match ─────────────────────────────────────────────────────
    if "store_match" not in result:
        result["store_match"] = result["verdict"] in ("top_priority", "strong_candidate")

    # ── Fill optional fields ───────────────────────────────────────────────────
    result.setdefault("product_tier", "rejected" if not result["store_match"] else "core_couple")
    result.setdefault("confidence", 0.70)
    result.setdefault("viral_angle", "")
    result.setdefault("emotional_hook", "")
    result.setdefault("content_hooks", [])
    result.setdefault("rejection_reason", "" if result["store_match"] else "Score below threshold")
    result.setdefault("product_name", _clean_name(product) if result["store_match"] else "")
    result.setdefault("caption", "")
    result["hashtags"] = result.get("hashtags") or _get_tags(product)
    result["audience"] = result.get("audience") or infer_audience(product)
    result["has_chinese_text"] = bool(result.get("has_chinese_text", False))
    result["chinese_text_note"] = str(result.get("chinese_text_note") or "")
    result["ai_provider"] = provider

    # Backfill legacy top-level fields so database.py write paths never store zeros.
    # database.py reads niche_fit/visual_appeal/trend_score directly from the product dict.
    result.setdefault("score", composite)
    result.setdefault("niche_fit",     result["scores"]["emotional_trigger"])
    result.setdefault("visual_appeal", result["scores"]["aesthetic_fit"])
    result.setdefault("trend_score",   result["scores"]["viral_potential"])

    return result


# ── Mock enrichment ────────────────────────────────────────────────────────────

def mock_enrich(product: dict) -> dict:
    raw_score    = product.get("raw_score", 50)
    margin       = float(product.get("margin_pct", 0))
    margin_bonus = min(15, max(0, (margin - 60) / 4))
    adjusted     = min(100, raw_score + margin_bonus)
    base         = adjusted / 10
    composite    = round(min(10.0, max(1.0, base + random.uniform(0.1, 0.5))), 1)

    emotional = round(min(10.0, composite * random.uniform(0.85, 1.05)), 1)
    viral     = round(min(10.0, composite * random.uniform(0.75, 1.15)), 1)
    gift      = round(min(10.0, composite * random.uniform(0.80, 1.10)), 1)
    aesthetic = round(min(10.0, composite * random.uniform(0.80, 1.10)), 1)
    impulse   = round(min(10.0, composite * random.uniform(0.75, 1.10)), 1)
    audience  = round(min(10.0, composite * random.uniform(0.80, 1.05)), 1)

    if composite >= 8.0 and emotional >= 8:
        verdict = "top_priority"
    elif composite >= 6.5 and emotional >= 6:
        verdict = "strong_candidate"
    elif composite >= 5.0:
        verdict = "pending_review"
    else:
        verdict = "auto_reject"

    store_match = verdict in ("top_priority", "strong_candidate")

    return {
        "product_tier":    "core_couple" if store_match else "rejected",
        "composite_score": composite,
        "score":           composite,
        "scores": {
            "emotional_trigger": emotional,
            "viral_potential":   viral,
            "giftability":       gift,
            "aesthetic_fit":     aesthetic,
            "impulse_score":     impulse,
            "audience_fit":      audience,
        },
        "confidence":        0.60,
        "verdict":           verdict,
        "store_match":       store_match,
        "viral_angle":       "",
        "emotional_hook":    "",
        "content_hooks":     [],
        "product_name":      _clean_name(product) if store_match else "",
        "caption":           random.choice(_CAPTION_TEMPLATES) if store_match else "",
        "hashtags":          _get_tags(product),
        "audience":          infer_audience(product),
        "has_chinese_text":  False,
        "chinese_text_note": "",
        "rejection_reason":  "" if store_match else "Score below threshold for niche",
        "ai_provider":       "mock",
    }


_CAPTION_TEMPLATES = [
    "პატარა საჩუქარია, მაგრამ ძალიან თბილი ემოცია აქვს. გაუკეთე სიურპრიზი ადამიანს, ვინც ყველაზე მეტად გიყვარს.",
    "ზოგი ნივთი უბრალოდ ამბობს: შენზე ვფიქრობდი. იდეალური პატარა საჩუქარია საყვარელი ადამიანისთვის.",
    "მონიშნე ის ადამიანი, ვისაც ეს აუცილებლად გაუხარდება. ასეთი დეტალები სიყვარულს კიდევ უფრო ტკბილს ხდის.",
    "საჩუქარი, რომელიც ყოველდღიურ დღეს პატარა დღესასწაულად აქცევს. იდეალურია წყვილებისთვის და გულწრფელი სიურპრიზისთვის.",
    "როცა გინდა უთხრა მიყვარხარ, მაგრამ უფრო საყვარლად. ეს ნივთი ზუსტად ამისთვისაა.",
]


# ── Gemini 2.5 Flash-Lite (image + text) ──────────────────────────────────────

_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
_GEMINI_MODEL_ALIASES: dict[str, str] = {
    # Map retired/legacy model names to their current replacements.
    # "gemini-2.5-flash-lite": "gemini-2.5-flash",  # example entry
}


def _gemini_model(settings: dict) -> str:
    configured = get_config("GEMINI_MODEL", settings.get("gemini_model", "gemini-2.5-flash"))
    model = str(configured or "gemini-2.5-flash").strip()
    replacement = _GEMINI_MODEL_ALIASES.get(model)
    if replacement:
        log.warning("Gemini model %s is deprecated; using %s", model, replacement)
        return replacement
    return model


async def _fetch_image_b64(url: str) -> Optional[tuple]:
    """Download image → (base64_str, mime_type) or None."""
    if not url:
        return None
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(url, follow_redirects=True,
                                 headers={"User-Agent": "Mozilla/5.0"})
            if r.status_code == 200:
                mime = r.headers.get("content-type", "image/jpeg").split(";")[0].strip()
                if not mime.startswith("image/"):
                    mime = "image/jpeg"
                return base64.b64encode(r.content).decode(), mime
    except Exception as exc:
        log.debug("Image fetch failed %s: %s", url, exc)
    return None


async def gemini_enrich(product: dict, settings: dict, context_snippet: str | None = None) -> Optional[dict]:
    global _GEMINI_QUOTA_EXHAUSTED
    api_key = get_config("GEMINI_KEY", settings.get("gemini_key", ""))
    if not api_key:
        return None
    if _GEMINI_QUOTA_EXHAUSTED:
        return None

    model = _gemini_model(settings)
    title   = product.get("title_translated") or product.get("title", "Unknown")
    img_url = (product.get("images") or [""])[0]

    text_part = {
        "text": (
            f"Title: {title}\n"
            f"Category: {product.get('category', '?')}\n"
            f"Cost: ₾{product.get('cost_eur','?')} → Sell: ₾{product.get('sell_price_eur','?')} "
            f"({product.get('margin_pct','?')}% margin)\n"
            f"Sold: {product.get('orders', 0)} | Platform: {product.get('source_platform','?')}\n"
            f"Keyword searched: {product.get('keyword', '?')}"
        )
    }

    parts = [text_part]
    img_data = await _fetch_image_b64(img_url)
    if img_data:
        b64, mime = img_data
        parts = [{"inline_data": {"mime_type": mime, "data": b64}}, text_part]
        log.debug("Gemini: image included for '%s'", title[:40])
    else:
        log.debug("Gemini: text-only (no image available) for '%s'", title[:40])

    payload = {
        "system_instruction": {"parts": [{"text": _build_system_text(context_snippet)}]},
        "contents": [{"parts": parts}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "max_output_tokens": 600,
            "temperature": 0.4,
        },
    }

    # ── Retry loop: 3 attempts with exponential back-off on transient errors ──
    _RETRYABLE = {429, 500, 502, 503, 504}
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    _GEMINI_URL.format(model=model),
                    headers={"x-goog-api-key": api_key, "content-type": "application/json"},
                    json=payload,
                )

            # Hard quota exhaustion — stop trying Gemini for this session
            if resp.status_code == 429:
                _GEMINI_QUOTA_EXHAUSTED = True
                log.warning("Gemini 429 quota exhausted — falling back to Groq (text-only)")
                return None

            # Transient server error: wait then retry
            if resp.status_code in _RETRYABLE:
                wait = 3 * (attempt + 1)  # 3s, 6s, 9s
                log.warning("Gemini API %d on attempt %d — retrying in %ds", resp.status_code, attempt + 1, wait)
                await asyncio.sleep(wait)
                continue

            if resp.status_code != 200:
                log.warning("Gemini API %d: %s", resp.status_code, resp.text[:300])
                return None

            body = resp.json()
            text = body["candidates"][0]["content"]["parts"][0]["text"]
            text = re.sub(r"```json|```", "", text).strip()
            result = json.loads(text)

            result = _normalize_enrichment(result, product, "gemini")
            log.info(
                "Gemini '%s' → composite=%.1f verdict=%s emotional=%s match=%s img=%s",
                title[:35],
                result.get("composite_score", 0),
                result.get("verdict", "?"),
                result.get("scores", {}).get("emotional_trigger", "?"),
                result.get("store_match"),
                "yes" if img_data else "no",
            )
            return result

        except json.JSONDecodeError as exc:
            log.warning("Gemini JSON parse error: %s", exc)
            return None
        except Exception as exc:
            wait = 3 * (attempt + 1)
            log.warning("Gemini enrichment error (attempt %d/%d, retry in %ds): %s", attempt + 1, 3, wait, exc)
            if attempt == 2:
                return None
            await asyncio.sleep(wait)

    return None


# ── Groq Llama 3.3 70B (TEXT-ONLY fallback) ───────────────────────────────────
# Groq cannot process images. It is used as a free text-only fallback when
# Gemini is unavailable (no key, quota exhausted, or network error).

_GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
_GROQ_MODEL = "llama-3.3-70b-versatile"


async def groq_enrich(product: dict, settings: dict) -> Optional[dict]:
    """Text-only scoring via Groq. No image analysis."""
    api_key = get_config("GROQ_KEY", settings.get("groq_key", ""))
    if not api_key:
        return None

    title = product.get("title_translated") or product.get("title", "Unknown")

    user_content = (
        f"Title: {title}\n"
        f"Category: {product.get('category', '?')}\n"
        f"Cost: ₾{product.get('cost_eur','?')} → Sell: ₾{product.get('sell_price_eur','?')} "
        f"({product.get('margin_pct','?')}% margin)\n"
        f"Sold: {product.get('orders', 0)} | Rating: {product.get('rating', 0)}/5\n"
        f"Keyword searched: {product.get('keyword', '?')}\n\n"
        "NOTE: No image available. Score conservatively on visual_appeal.\n"
        "Respond with ONLY a JSON object — no markdown, no explanation."
    )

    _RETRYABLE = {429, 500, 502, 503, 504}

    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    _GROQ_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": _GROQ_MODEL,
                        "messages": [
                            {"role": "system", "content": _GROQ_SYSTEM},
                            {"role": "user",   "content": user_content},
                        ],
                        "max_tokens": 600,
                        "temperature": 0.4,
                        "response_format": {"type": "json_object"},
                    },
                )

            # Transient errors: retry with back-off
            if resp.status_code in _RETRYABLE:
                wait = 3 * (attempt + 1)
                log.warning("Groq API %d on attempt %d — retrying in %ds", resp.status_code, attempt + 1, wait)
                await asyncio.sleep(wait)
                continue

            if resp.status_code != 200:
                log.warning("Groq API %d: %s", resp.status_code, resp.text[:300])
                return None

            text = resp.json()["choices"][0]["message"]["content"]
            text = re.sub(r"```json|```", "", text).strip()
            result = json.loads(text)

            result = _normalize_enrichment(result, product, "groq")
            log.info(
                "Groq (text-only) '%s' → composite=%.1f verdict=%s match=%s",
                title[:35],
                result.get("composite_score", 0),
                result.get("verdict", "?"),
                result.get("store_match"),
            )
            return result

        except json.JSONDecodeError as exc:
            log.warning("Groq JSON parse error: %s", exc)
            return None
        except Exception as exc:
            wait = 3 * (attempt + 1)
            log.warning("Groq enrichment error (attempt %d/%d, retry in %ds): %s", attempt + 1, 3, wait, exc)
            if attempt == 2:
                return None
            await asyncio.sleep(wait)

    return None


# ── Public entry point ─────────────────────────────────────────────────────────

async def ai_enrich(product: dict, settings: dict, context_snippet: str | None = None) -> Optional[dict]:
    """
    Enrich a product with AI scoring.

    Chain:
      1. Gemini (image + text) — best quality, uses actual product photos
      2. Groq (text-only)      — free fallback when Gemini is unavailable
      3. Mock (rule-based)     — always works, zero cost

    context_snippet is injected into the Gemini system prompt when the
    ai_context_injection feature flag is ON and enough decision history exists.
    Pass None (the default) to preserve the pre-Phase-2 baseline behavior.

    Gemini MUST be configured (Settings → gemini_key) for real image analysis.
    Groq is only for metadata-based fallback scoring.
    """
    async with _get_semaphore():
        # 1. Gemini — primary scorer, analyzes actual product images
        result = await gemini_enrich(product, settings, context_snippet)
        if result:
            return result

        # 2. Groq — text-only fallback (free, no image analysis)
        result = await groq_enrich(product, settings)
        if result:
            return result

        # 3. Mock — last resort, always available
        return mock_enrich(product)

async def ai_enrich_batch(products: list[dict], settings: dict, context_snippet: str | None = None) -> list[dict]:
    """
    Groups products into a collage and sends to Gemini for batch scoring.
    Saves 80%+ on Vision tokens.

    context_snippet is injected into the Gemini system prompt when the
    ai_context_injection feature flag is ON and enough decision history exists.
    Pass None (the default) to preserve the pre-Phase-2 baseline behavior.
    """
    if not products:
        return []

    api_key = get_config("GEMINI_KEY", settings.get("gemini_key", ""))
    if not api_key:
        # Fallback to individual mock scoring if no key
        return [mock_enrich(p) for p in products]

    # 1. Create collage
    image_urls = [(p.get("images") or [""])[0] for p in products]
    collage_bytes = await create_collage(image_urls)
    
    if not collage_bytes:
        log.warning("Failed to create collage for batch, falling back to mock")
        return [mock_enrich(p) for p in products]

    # 2. Prepare Gemini Payload
    model = _gemini_model(settings)
    b64_collage = base64.b64encode(collage_bytes).decode()
    
    products_text = "\n".join([
        f"Prod {i+1}: {p.get('title_translated') or p.get('title')[:60]} (₾{p.get('cost_eur')})"
        for i, p in enumerate(products)
    ])

    payload = {
        "system_instruction": {"parts": [{"text": _build_system_text(context_snippet)}]},
        "contents": [{
            "parts": [
                {"inline_data": {"mime_type": "image/jpeg", "data": b64_collage}},
                {"text": f"Evaluate these 6 products:\n{products_text}"}
            ]
        }],
        "generationConfig": {
            "response_mime_type": "application/json",
            "max_output_tokens": 2500,
            "temperature": 0.3,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=45) as client:
            resp = await client.post(
                _GEMINI_URL.format(model=model),
                headers={"x-goog-api-key": api_key, "content-type": "application/json"},
                json=payload,
            )
        
        if resp.status_code != 200:
            log.warning(f"Batch Gemini error {resp.status_code}: {resp.text[:200]}")
            return [mock_enrich(p) for p in products]

        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        text = re.sub(r"```json|```", "", text).strip()
        results_list = json.loads(text).get("results", [])

        enriched_results = []
        for i, p in enumerate(products):
            res = next((r for r in results_list if r.get("product_index") == i + 1), {})
            enriched_results.append(_normalize_enrichment(res, p, "gemini-batch"))

        return enriched_results

    except Exception as e:
        log.error(f"Batch Vision AI failed: {e}")
        return [mock_enrich(p) for p in products]
