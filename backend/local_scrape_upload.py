"""
Continuous live scraper — scrapes CSSBuy and streams products to DropOS.

Runs indefinitely: cycles through all keywords, uploads per-keyword as scraped,
sleeps for --interval seconds, then repeats. Kill with Ctrl+C.

Required env:
  WEBSITE_URL=https://your-site.example.com
  INGEST_API_TOKEN=your-shared-token
  CSSBUY_USERNAME=your-cssbuy-login
  CSSBUY_PASSWORD=your-cssbuy-password

Optional env:
  SCAN_KEYWORDS=keyword one,keyword two   (comma-separated)
  MAX_PER_KEYWORD=0                       (0 = unlimited)
  CSSBUY_SOURCE=1688|taobao|both
  CAPTCHA_2CAPTCHA_KEY=...
  SCRAPE_INTERVAL=3600                    (seconds between full cycles)
"""

import argparse
import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Sequence

import httpx

sys.path.insert(0, os.path.dirname(__file__))

import scraper_cssbuy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("live_scraper")


def _csv(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


def _arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Continuously scrape CSSBuy and stream products live to DropOS.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--website-url", default=os.getenv("WEBSITE_URL", ""),
                        help="Hosted DropOS URL (e.g. https://dropos.railway.app)")
    parser.add_argument("--token", default=os.getenv("INGEST_API_TOKEN", ""),
                        help="Shared ingest API token")
    parser.add_argument("--keywords", nargs="*", default=None,
                        help="Keywords to scan (space-separated). Overrides SCAN_KEYWORDS env.")
    parser.add_argument("--max-per-keyword", type=int,
                        default=int(os.getenv("MAX_PER_KEYWORD", "0")),
                        help="Max products per keyword per cycle. 0 = unlimited (default).")
    parser.add_argument("--source", default=os.getenv("CSSBUY_SOURCE", "1688"),
                        choices=("1688", "taobao", "both"))
    parser.add_argument("--username", default=os.getenv("CSSBUY_USERNAME", ""))
    parser.add_argument("--password", default=os.getenv("CSSBUY_PASSWORD", ""))
    parser.add_argument("--captcha-key", default=os.getenv("CAPTCHA_2CAPTCHA_KEY", ""))
    parser.add_argument("--interval", type=int,
                        default=int(os.getenv("SCRAPE_INTERVAL", "3600")),
                        help="Seconds to wait between full keyword cycles (default 3600).")
    parser.add_argument("--once", action="store_true",
                        help="Run one cycle then exit (default: loop forever).")
    parser.add_argument("--payload-out", default=os.getenv("LOCAL_SCRAPE_PAYLOAD_OUT", ""),
                        help="Optional path to save last-cycle payload as JSON.")
    return parser


async def _upload_keyword(
    website_url: str,
    token: str,
    keyword: str,
    source: str,
    products: list,
) -> dict:
    """Upload products for a single keyword immediately after scraping."""
    payload = {
        "keywords": [keyword],
        "source": source,
        "products": products,
    }
    url = website_url.rstrip("/") + "/api/ingest/products"
    async with httpx.AsyncClient(timeout=90) as client:
        resp = await client.post(
            url, json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code >= 400:
            raise RuntimeError(
                f"Upload failed HTTP {resp.status_code}: {resp.text[:500]}"
            )
        return resp.json()


async def _run_cycle(
    website_url: str,
    token: str,
    keywords: list[str],
    max_per_keyword: int,
    source: str,
    username: str,
    password: str,
    captcha_key: str,
    payload_out: str,
    cycle_num: int,
) -> dict:
    """Run one full cycle: scrape all keywords, upload each immediately."""
    cycle_start = time.time()
    total_scraped = 0
    total_uploaded = 0
    all_products = []

    log.info("━━━ Cycle #%d started — %d keyword(s) ━━━", cycle_num, len(keywords))

    for idx, keyword in enumerate(keywords, 1):
        kw_start = time.time()
        limit = max_per_keyword if max_per_keyword > 0 else 9999
        log.info("[%d/%d] Scraping keyword: %r (max %s)", idx, len(keywords),
                 keyword, "unlimited" if max_per_keyword == 0 else str(limit))

        try:
            products = await scraper_cssbuy.scrape(
                [keyword], limit,
                username=username, password=password,
                captcha_key=captcha_key, source=source,
            )
        except Exception as exc:
            log.error("  Scrape failed for %r: %s", keyword, exc)
            continue

        elapsed_scrape = time.time() - kw_start
        log.info("  Scraped %d products in %.1fs", len(products), elapsed_scrape)

        if not products:
            log.info("  No products — skipping upload")
            continue

        total_scraped += len(products)
        all_products.extend(products)

        try:
            result = await _upload_keyword(website_url, token, keyword, source, products)
            job_id = result.get("job_id", "?")
            accepted = result.get("products", len(products))
            total_uploaded += accepted
            log.info("  ✓ Uploaded → job #%s (%d products accepted)", job_id, accepted)
        except Exception as exc:
            log.error("  Upload failed for %r: %s", keyword, exc)

    elapsed_cycle = time.time() - cycle_start

    if payload_out and all_products:
        try:
            Path(payload_out).write_text(
                json.dumps({"keywords": keywords, "source": source, "products": all_products},
                           ensure_ascii=False),
                encoding="utf-8",
            )
        except Exception as exc:
            log.warning("Could not save payload: %s", exc)

    summary = {
        "cycle": cycle_num,
        "keywords": len(keywords),
        "scraped": total_scraped,
        "uploaded": total_uploaded,
        "elapsed_s": round(elapsed_cycle, 1),
    }
    log.info("━━━ Cycle #%d done in %.0fs — scraped %d, uploaded %d ━━━",
             cycle_num, elapsed_cycle, total_scraped, total_uploaded)
    return summary


async def main(argv: Sequence[str] | None = None) -> int:
    args = _arg_parser().parse_args(argv)

    env_keywords = _csv(os.getenv("SCAN_KEYWORDS", ""))
    keywords = args.keywords if args.keywords is not None else env_keywords

    missing = []
    if not args.website_url:  missing.append("WEBSITE_URL / --website-url")
    if not args.token:         missing.append("INGEST_API_TOKEN / --token")
    if not args.username:      missing.append("CSSBUY_USERNAME / --username")
    if not args.password:      missing.append("CSSBUY_PASSWORD / --password")
    if not keywords:           missing.append("SCAN_KEYWORDS env or --keywords")
    if missing:
        log.error("Missing required settings:\n" + "\n".join(f"  • {m}" for m in missing))
        return 2

    mode = "once" if args.once else f"loop every {args.interval}s"
    limit_label = "unlimited" if args.max_per_keyword == 0 else str(args.max_per_keyword)
    log.info("Live scraper starting — mode=%s source=%s keywords=%d max/keyword=%s",
             mode, args.source, len(keywords), limit_label)
    log.info("Keywords: %s", ", ".join(repr(k) for k in keywords))

    cycle = 0
    while True:
        cycle += 1
        try:
            await _run_cycle(
                website_url=args.website_url,
                token=args.token,
                keywords=keywords,
                max_per_keyword=args.max_per_keyword,
                source=args.source,
                username=args.username,
                password=args.password,
                captcha_key=args.captcha_key,
                payload_out=args.payload_out,
                cycle_num=cycle,
            )
        except KeyboardInterrupt:
            break
        except Exception as exc:
            log.error("Cycle #%d crashed: %s", cycle, exc)

        if args.once:
            break

        next_run = datetime.now().strftime("%H:%M:%S")
        log.info("Sleeping %ds — next cycle at ~%s. Press Ctrl+C to stop.",
                 args.interval, next_run)
        try:
            await asyncio.sleep(args.interval)
        except asyncio.CancelledError:
            break

    log.info("Scraper stopped after %d cycle(s).", cycle)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main()))
    except KeyboardInterrupt:
        log.info("Interrupted by user.")
        raise SystemExit(0)
