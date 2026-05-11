import hashlib
import logging
import math

from config.runtime import get_config

log = logging.getLogger(__name__)


def pretty_price(value: float) -> float:
    """Fixes the logic gaps to ensure prices always scale upward."""
    if value <= 0: return 0.0
    if value < 20: return 29.90
    if value < 45: return 44.90
    if value < 65: return 64.90
    # For expensive items, round to the nearest .90
    return round(math.ceil(value) - 0.10, 2)

def profit_filter(product: dict, settings: dict) -> bool:
    price_cny = float(product.get("price_cny", 0))
    exchange_rate = float(get_config("EXCHANGE_RATE", settings.get("exchange_rate", 0.353)))
    
    # 1688 shipping is often cheaper than Taobao per item
    shipping_cny = 10.0 if product.get("source_platform") == "1688" else 15.0
    cost_eur = (price_cny + shipping_cny) * exchange_rate

    # Dynamic Markup based on product type
    is_tech = any(x in product.get("title", "").lower() for x in ["camera", "ccd", "electronics"])
    
    if cost_eur < 10:
        markup = float(get_config("SELL_MARKUP_LOW", settings.get("sell_markup_low", 3.5)))
    elif is_tech:
        markup = float(get_config("SELL_MARKUP_HIGH", settings.get("sell_markup_high", 2.2)))
    else:
        markup = float(get_config("SELL_MARKUP_MID", settings.get("sell_markup_mid", 2.8)))

    sell_price = pretty_price(cost_eur * markup)
    margin = ((sell_price - cost_eur) / sell_price) * 100

    base_min_margin = float(get_config("MIN_MARGIN", settings.get("min_margin", 60.0)))
    min_margin_req = 45.0 if cost_eur > 30 else base_min_margin

    product["cost_eur"] = round(cost_eur, 2)
    product["sell_price_eur"] = round(sell_price, 2)
    product["margin_pct"] = round(margin, 1)

    return margin >= min_margin_req

_CONTENT_REJECTS = [
    # Plush / stuffed animals / cartoon IP — common on Taobao, zero couple angle
    "plush", "stuffed animal", "stuffed toy", "plushie",
    "stitch", "sanrio", "hello kitty", "cinnamoroll", "kuromi", "pompompurin",
    "pokemon", "pokémon", "pikachu", "eevee",
    "disney", "mickey", "minnie", "winnie the pooh",
    "barbie", "snoopy", "care bear",
    # Food / consumables
    "supplement", "protein powder", "vitamin", "collagen",
    "snack gift", "food gift", "coffee gift", "tea gift", "chocolate gift",
]

_DEMOGRAPHIC_REJECTS = [
    "baby", "infant", "toddler", "newborn", "formula", "diaper",
    "children's", "kids", "age 3", "age 4", "age 5", "age 6",
    "toy for", "puzzle for kids", "educational toy",
    "elderly", "senior", "walking cane", "mobility aid",
    "maternity", "pregnant", "nursing", "mother's day", "mom gift",
    "teacher gift", "teacher appreciation",
]

_INDUSTRY_REJECTS = [
    "engine oil", "motor oil", "lubricant", "brake fluid",
    "pest spray", "herbicide", "fertilizer", "agricultural",
    "wholesale", "bulk order", "factory price", "moq", "minimum order",
    "100pcs", "50pcs", "lot of", "per dozen", "oem", "odm",
    "steel plate", "pvc pipe", "circuit board", "industrial",
]

_BRAND_REJECTS = [
    "gucci", "louis vuitton", "chanel", "dior", "prada", "givenchy",
    "cartier", "tiffany", "pandora", "swarovski", "rolex", "versace",
]

# B2B / bulk-manufacturing signals — "custom print" removed because retail
# couple gift products (matching hoodies, phone cases) legitimately use it.
# "factory" alone removed — too broad (catches "factory direct lamp" etc.).
# "factory price" / "factory outlet" covered by _INDUSTRY_REJECTS instead.
_SPAM_FRAGMENTS = [
    "oem", "bulk order", "custom logo", "1000pcs",
    "minimum order", "private label",
    "wholesale", "factory direct", "factory outlet", "supplier", "reseller",
    "100pcs", "50pcs", "per lot", "lot of",
]

# Material-level signals for clearly off-brand products.
_CHEAP_MATERIAL_FRAGMENTS = [
    "plastic bracelet", "plastic necklace", "plastic ring",
    "rubber bracelet", "rubber keychain",
    "silicone bracelet", "silicone wristband",
    "acrylic ring", "acrylic necklace",
    "resin bracelet", "resin necklace", "resin ring",
    "eva foam", "pvc keychain",
]

# Lowered from 8.0 — stationery and cards (greeting cards, bookmarks) often
# cost 5–7 CNY with 20k+ orders and are strong couple gift products.
_MIN_PRICE_CNY = 5.0


def basic_filter(products: list, settings: dict) -> list:
    out = []
    seen_titles: dict = {}   # title_hash → product index in out

    for p in products:
        if not p.get("title") or not p.get("price_cny"):
            p["_bouncer_reason"] = "Bouncer: missing title or price"
            continue

        platform = p.get("source_platform", "")

        if platform == "1688":
            orders = int(p.get("orders") or 0)
            if orders < 1:
                p["_bouncer_reason"] = f"Bouncer: zero orders ({orders})"
                continue

        title_lower = (p.get("title_translated") or p.get("title", "")).lower()
        desc_lower = (p.get("description") or "").lower()
        text = f"{title_lower} {desc_lower}"

        matched_content = next((f for f in _CONTENT_REJECTS if f in text), None)
        if matched_content:
            p["_bouncer_reason"] = f"hard_reject: content ({matched_content!r})"
            continue

        matched_demo = next((f for f in _DEMOGRAPHIC_REJECTS if f in text), None)
        if matched_demo:
            p["_bouncer_reason"] = f"hard_reject: demographic ({matched_demo!r})"
            continue

        matched_industry = next((f for f in _INDUSTRY_REJECTS if f in text), None)
        if matched_industry:
            p["_bouncer_reason"] = f"hard_reject: industry ({matched_industry!r})"
            continue

        matched_brand = next((f for f in _BRAND_REJECTS if f in text), None)
        if matched_brand:
            p["_bouncer_reason"] = f"hard_reject: brand ({matched_brand!r})"
            continue

        matched_spam = next((f for f in _SPAM_FRAGMENTS if f in title_lower), None)
        if matched_spam:
            p["_bouncer_reason"] = f"Bouncer: spam keyword ({matched_spam!r})"
            continue

        matched_cheap = next((f for f in _CHEAP_MATERIAL_FRAGMENTS if f in title_lower), None)
        if matched_cheap:
            p["_bouncer_reason"] = f"Bouncer: cheap material ({matched_cheap!r})"
            continue

        price_cny = float(p.get("price_cny", 0))
        if price_cny < _MIN_PRICE_CNY:
            p["_bouncer_reason"] = f"Bouncer: price too low ({price_cny:.1f} CNY)"
            continue

        if platform != "1688":
            min_rating = float(get_config("MIN_RATING", settings.get("min_rating", 4.0)))
            rating = float(p.get("rating") or 0)
            if rating > 0 and rating < min_rating:
                p["_bouncer_reason"] = f"Bouncer: low rating ({rating})"
                continue

        if not p.get("images"):
            p["_bouncer_reason"] = "Bouncer: no images"
            continue

        # ── Title dedup (works across all keywords since raw_all is combined) ──
        title_hash = hashlib.md5(title_lower[:40].encode()).hexdigest()
        if title_hash in seen_titles:
            idx = seen_titles[title_hash]
            existing = out[idx]
            if (p.get("orders", 0) > existing.get("orders", 0) or
                    (p.get("orders", 0) == existing.get("orders", 0) and
                     p.get("price_cny", 999) < existing.get("price_cny", 999))):
                out[idx] = p
            continue

        seen_titles[title_hash] = len(out)
        out.append(p)

    # Sort 1688 by sold count descending so best sellers surface first
    out.sort(
        key=lambda p: p.get("orders", 0) if p.get("source_platform") == "1688" else 0,
        reverse=True,
    )
    return out




def dedup(products: list) -> list:
    """
    Second-pass dedup after profit_filter.
    Checks both image URL and source_id to catch duplicates that slipped
    through title dedup (e.g. same product, different keyword, slightly different title).
    """
    seen_images: set = set()
    seen_ids: set = set()
    out = []

    for p in products:
        # Dedup by source_id first (same product, different keyword run)
        sid = p.get("source_id", "")
        if sid and sid in seen_ids:
            continue
        if sid:
            seen_ids.add(sid)

        # Dedup by first image URL (catches same product from different sources)
        img = (p.get("images") or [""])[0]
        img_key = hashlib.md5(img.encode()).hexdigest() if img else None
        if img_key and img_key in seen_images:
            continue
        if img_key:
            seen_images.add(img_key)

        out.append(p)

    return out
