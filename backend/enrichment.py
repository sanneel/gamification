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
You are a product curator for Tskvili, a romantic gift store for Gen-Z couples in Georgia (ages 16–26). Products are bought by one person for their partner. Price range is ₾40–₾119.
The single most important question: would a 20-year-old girl see this on TikTok and immediately send it to her boyfriend saying "omg we need this"? If yes → approve. If it needs explaining why it's romantic → reject.
APPROVE products that are:
- Cute, aesthetic, or emotionally triggering with a clear romantic angle
- Matching jewelry sets (necklaces, bracelets, rings) — any material, not just silver
- Projection necklaces, moon/star/sun pendants
- Long-distance touch products (smart bracelets, touch lamps)
- Cute plushies with a romantic angle (sold as a gift for partner)
- Open-when letter kits, reasons-I-love-you jars, love note sets
- Star projectors, galaxy lamps — if well-photographed with romantic framing
- Neon signs with romantic text
- Coquette aesthetic accessories (bows, pearls, heart charms)
- Anything that looks good in a TikTok or Instagram Reels post
- Clean or moody product photography — both dark romance and soft pastel work
REJECT products that are:
- Over ₾119 sell price
- Generic gift boxes with no clear hero product
- Wedding/engagement rings (too serious, wrong demographic)
- Gold rings that look like wedding bands
- His/hers mugs, matching hoodies, basic text items — oversaturated
- Children's toys with no romantic angle
- Industrial, home appliance, kitchen, office products
- Images with Chinese supplier watermarks, factory logos, or certificate badges
- Anything where you have to stretch to explain the romantic connection
SCORING:
cute_appeal (0–10) × 0.30 — Is this instantly cute or beautiful? Would someone screenshot it?
romantic_trigger (0–10) × 0.25 — Does it create a "thinking of you" or "we need this" feeling?
visual_score (0–10) × 0.20 — Can this image be posted to Instagram right now as-is?
trend_fit (0–10) × 0.15 — Does this feel current — TikTok, coquette, soft girl, dark romance, or viral?
giftability (0–10) × 0.10 — Is this clearly something you'd buy for a romantic partner?
composite = (cute_appeal×0.30) + (romantic_trigger×0.25) + (visual_score×0.20) + (trend_fit×0.15) + (giftability×0.10)
VERDICTS:
top_priority:     composite ≥ 8.0 AND romantic_trigger ≥ 7
strong_candidate: composite ≥ 7.0
pending_review:   composite ≥ 6.0
auto_reject:      composite < 6.0 OR any hard reject triggered
Return ONLY valid JSON:
{
  "cute_appeal": int,
  "romantic_trigger": int,
  "visual_score": int,
  "trend_fit": int,
  "giftability": int,
  "composite": float,
  "verdict": "top_priority|strong_candidate|pending_review|auto_reject",
  "product_tier": "cute_romantic|matching_jewelry|emotional_gift|aesthetic_decor|auto_reject",
  "rejection_reason": "string or null",
  "viral_angle": "one sentence or null",
  "emotional_hook": "one sentence or null",
  "confidence": float
}
"""

_GROQ_SYSTEM = """
You are an elite product curator for CUTE COUPLE GIFTS — a premium Gen-Z and Millennial couple gift brand on Instagram. You should reject the majority of what you see.
NOTE: TEXT-ONLY analysis — no image access. Cap visual_score at 6 unless the title or description clearly confirms aesthetic quality.

THE BRAND:
- Aesthetic: dark romance, minimalist silver, soft pink, Y2K, cottagecore
- Audience: couples aged 16–30, buying gifts for each other
- NOT: generic, childish, grandma gifts, home decor, hobby items, fashion accessories without a clear couple angle

HARD REJECT — verdict="auto_reject" immediately if ANY applies:
- Plush toys, stuffed animals, cartoon characters (Stitch, Sanrio, Barbie, Disney, Pokémon)
- Generic gift sets with no specific couple identity (random mugs, notebooks, pens, cosmetics)
- Items marketed to mothers, teachers, children, elderly, or professionals
- Industrial, automotive, agricultural, or B2B products
- Luxury brand dupes or counterfeits
- Food, supplements, or consumables

SCORING (each 0–10):
couple_angle (0.30): Made for couples or easily gifted between partners? 10=exclusively for couples, 0=no couple application
emotional_trigger (0.25): Creates feelings of love, nostalgia, longing, excitement? 10=deep emotional product, 0=emotionally dead
visual_score (0.20): Instagram-worthy? TEXT-ONLY: cap at 6 unless title confirms premium aesthetic
trend_alignment (0.15): Fits Gen-Z couple trends now? 10=Y2K/dark romance/coquette/kawaii, 0=dated
demographic_fit (0.10): For 16–30 year old couples? 10=unmistakably, 0=wrong demographic

composite = (couple_angle×0.30) + (emotional_trigger×0.25) + (visual_score×0.20) + (trend_alignment×0.15) + (demographic_fit×0.10)

VERDICT: top_priority (≥8.0 AND emotional_trigger≥8) | strong_candidate (≥7.0 AND emotional_trigger≥6) | pending_review (≥6.0) | auto_reject (<6.0)
store_match = true ONLY IF top_priority or strong_candidate

Return ONLY JSON (no markdown):
{
  "couple_angle": 0-10, "emotional_trigger": 0-10, "visual_score": 0-10,
  "trend_alignment": 0-10, "demographic_fit": 0-10, "composite": float,
  "verdict": "top_priority|strong_candidate|pending_review|auto_reject",
  "product_tier": "core_couple|viral_adjacent|sentimental|lifestyle|auto_reject",
  "confidence": 0.0-1.0, "store_match": true|false,
  "viral_angle": "one sentence or null", "emotional_hook": "one sentence or null",
  "rejection_reason": "string or null",
  "product_name": "Georgian 3-5 words if store_match=true else empty string",
  "caption": "Georgian 2-3 sentences if store_match=true else empty string",
  "hashtags": []
}
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

    Handles three input shapes:
    - New flat schema: couple_angle, emotional_trigger, visual_score, trend_alignment,
      demographic_fit, composite — produced by the current prompts.
    - Mid-generation schema: composite_score + scores sub-object.
    - Legacy schema: niche_fit + visual_appeal + trend_score (old Groq/mock).
    """
    new_schema = "couple_angle" in result or (
        "composite" in result and "composite_score" not in result
    )

    if new_schema:
        # ── New flat schema ────────────────────────────────────────────────────
        couple    = float(result.get("couple_angle", 0))
        emotional = float(result.get("emotional_trigger", 0))
        visual    = float(result.get("visual_score", 0))
        trend     = float(result.get("trend_alignment", 0))
        demo      = float(result.get("demographic_fit", 0))
        composite = float(result.get("composite", 0))
        # Recompute if the AI returned 0 (safety net)
        if composite == 0 and (couple + emotional + visual + trend + demo) > 0:
            composite = round(couple*0.30 + emotional*0.25 + visual*0.20 + trend*0.15 + demo*0.10, 2)
        result["composite_score"] = composite
        result["scores"] = {
            "couple_angle":      round(couple, 1),
            "emotional_trigger": round(emotional, 1),
            "visual_score":      round(visual, 1),
            "trend_alignment":   round(trend, 1),
            "demographic_fit":   round(demo, 1),
        }
    else:
        # ── Legacy / mid-generation schema ────────────────────────────────────
        if "composite_score" not in result:
            niche_l  = float(result.get("niche_fit", 0))
            visual_l = float(result.get("visual_appeal", 0))
            trend_l  = float(result.get("trend_score", 0))
            result["composite_score"] = round(niche_l*0.50 + visual_l*0.30 + trend_l*0.20, 2)
        composite = float(result["composite_score"])

        if "scores" not in result:
            niche_l  = float(result.get("niche_fit", 0))
            visual_l = float(result.get("visual_appeal", 0))
            trend_l  = float(result.get("trend_score", 0))
            fallback = round(composite * 0.9, 1) if composite else 0.0
            result["scores"] = {
                "emotional_trigger": round(niche_l, 1) if niche_l else fallback,
                "viral_potential":   round(trend_l, 1) if trend_l else fallback,
                "giftability":       round(niche_l * 0.9, 1) if niche_l else fallback,
                "aesthetic_fit":     round(visual_l, 1) if visual_l else fallback,
                "impulse_score":     round(trend_l * 0.9, 1) if trend_l else fallback,
                "audience_fit":      round(niche_l * 0.85, 1) if niche_l else fallback,
            }
        emotional = float(result["scores"].get("emotional_trigger", 0))

    composite = float(result.get("composite_score", 0))
    if new_schema:
        emotional = float(result.get("emotional_trigger", 0))

    # ── Derive verdict ─────────────────────────────────────────────────────────
    if "verdict" not in result:
        if composite >= 8.0 and emotional >= 8:
            verdict = "top_priority"
        elif composite >= 7.0 and emotional >= 6:
            verdict = "strong_candidate"
        elif composite >= 6.0:
            verdict = "pending_review"
        else:
            verdict = "auto_reject"
        result["verdict"] = verdict

    # ── Derive store_match ─────────────────────────────────────────────────────
    if "store_match" not in result:
        result["store_match"] = result["verdict"] in ("top_priority", "strong_candidate")

    # ── Fill optional fields ───────────────────────────────────────────────────
    result.setdefault("product_tier", "auto_reject" if not result["store_match"] else "core_couple")
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
    result.setdefault("score", composite)
    if new_schema:
        result.setdefault("niche_fit",     float(result.get("emotional_trigger", 0)))
        result.setdefault("visual_appeal", float(result.get("visual_score", 0)))
        result.setdefault("trend_score",   float(result.get("trend_alignment", 0)))
    else:
        result.setdefault("niche_fit",     result["scores"].get("emotional_trigger", 0))
        result.setdefault("visual_appeal", result["scores"].get("aesthetic_fit", 0))
        result.setdefault("trend_score",   result["scores"].get("viral_potential", 0))

    return result


# ── Mock enrichment ────────────────────────────────────────────────────────────

def mock_enrich(product: dict) -> dict:
    raw_score    = product.get("raw_score", 50)
    margin       = float(product.get("margin_pct", 0))
    margin_bonus = min(15, max(0, (margin - 60) / 4))
    adjusted     = min(100, raw_score + margin_bonus)
    base         = adjusted / 10

    couple    = round(min(10.0, max(1.0, base * random.uniform(0.80, 1.05))), 1)
    emotional = round(min(10.0, base * random.uniform(0.85, 1.05)), 1)
    visual    = round(min(10.0, base * random.uniform(0.75, 1.10)), 1)
    trend     = round(min(10.0, base * random.uniform(0.75, 1.10)), 1)
    demo      = round(min(10.0, base * random.uniform(0.80, 1.05)), 1)
    composite = round(couple*0.30 + emotional*0.25 + visual*0.20 + trend*0.15 + demo*0.10, 1)

    if composite >= 8.0 and emotional >= 8:
        verdict = "top_priority"
    elif composite >= 7.0 and emotional >= 6:
        verdict = "strong_candidate"
    elif composite >= 6.0:
        verdict = "pending_review"
    else:
        verdict = "auto_reject"

    store_match = verdict in ("top_priority", "strong_candidate")

    return {
        "couple_angle":      couple,
        "emotional_trigger": emotional,
        "visual_score":      visual,
        "trend_alignment":   trend,
        "demographic_fit":   demo,
        "product_tier":      "core_couple" if store_match else "auto_reject",
        "composite_score":   composite,
        "score":             composite,
        "scores": {
            "couple_angle":      couple,
            "emotional_trigger": emotional,
            "visual_score":      visual,
            "trend_alignment":   trend,
            "demographic_fit":   demo,
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
        "rejection_reason":  "" if store_match else "Score below threshold",
        "ai_provider":       "mock",
        "niche_fit":         emotional,
        "visual_appeal":     visual,
        "trend_score":       trend,
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

    desc = (product.get("description") or "")[:300]
    user_content = (
        f"Title: {title}\n"
        f"Description: {desc}\n"
        f"Category: {product.get('keyword') or product.get('category', '?')}\n"
        f"Sell price: ₾{product.get('sell_price_eur','?')}\n"
        f"Orders: {product.get('orders', 0)} | Rating: {product.get('rating', 0)}/5\n\n"
        "NOTE: No image available. Cap visual_score at 6 unless title confirms premium aesthetic.\n"
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
