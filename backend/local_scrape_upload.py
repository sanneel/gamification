"""
Run CSSBuy scraping locally and upload the scraped data to the hosted website.

Scrapes one keyword at a time, uploads immediately after each keyword finishes,
then moves to the next. Loops forever with --interval between full cycles.

Required env:
  WEBSITE_URL=https://your-site.example.com
  INGEST_API_TOKEN=your-shared-token
  CSSBUY_USERNAME=your-cssbuy-login
  CSSBUY_PASSWORD=your-cssbuy-password

Optional env:
  SCAN_KEYWORDS=keyword one,keyword two
  MAX_PER_KEYWORD=100
  CSSBUY_SOURCE=1688|taobao|both
  CAPTCHA_2CAPTCHA_KEY=...
  UPLOAD_BATCH_SIZE=100
  SCRAPE_INTERVAL=3600
"""

import argparse
import asyncio
import json
import logging
import os
import sys
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
log = logging.getLogger("scraper")


def _csv(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


def _arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Scrape CSSBuy and upload per keyword.")
    parser.add_argument("--website-url", default=os.getenv("WEBSITE_URL", ""))
    parser.add_argument("--token", default=os.getenv("INGEST_API_TOKEN", ""))
    parser.add_argument("--keywords", nargs="*", default=None)
    parser.add_argument("--max-per-keyword", type=int, default=int(os.getenv("MAX_PER_KEYWORD", "100")))
    parser.add_argument("--source", default=os.getenv("CSSBUY_SOURCE", "1688"), choices=("1688", "taobao", "both"))
    parser.add_argument("--username", default=os.getenv("CSSBUY_USERNAME", ""))
    parser.add_argument("--password", default=os.getenv("CSSBUY_PASSWORD", ""))
    parser.add_argument("--captcha-key", default=os.getenv("CAPTCHA_2CAPTCHA_KEY", ""))
    parser.add_argument("--upload-batch", type=int, default=int(os.getenv("UPLOAD_BATCH_SIZE", "100")))
    parser.add_argument("--interval", type=int, default=int(os.getenv("SCRAPE_INTERVAL", "0")),
                        help="Seconds between full cycles. 0 = run once.")
    return parser


async def _upload(website_url: str, token: str, payload: dict) -> dict:
    url = website_url.rstrip("/") + "/api/ingest/products"
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})
        if response.status_code >= 400:
            raise RuntimeError(f"Upload failed: HTTP {response.status_code}\n{response.text[:500]}")
        return response.json()


async def scrape_and_upload_keyword(args, keyword: str, idx: int, total: int) -> int:
    """Scrape one keyword, upload immediately in chunks. Returns products uploaded."""
    log.info("[%d/%d] Scraping: %r", idx, total, keyword)

    products = await scraper_cssbuy.scrape(
        [keyword],
        args.max_per_keyword,
        username=args.username,
        password=args.password,
        captcha_key=args.captcha_key,
        source=args.source,
    )

    log.info("[%d/%d] Scraped %d products — uploading now", idx, total, len(products))

    if not products:
        log.warning("[%d/%d] No products scraped for %r", idx, total, keyword)
        return 0

    chunks = [products[i:i + args.upload_batch] for i in range(0, len(products), args.upload_batch)]
    uploaded = 0

    for cidx, chunk in enumerate(chunks, 1):
        try:
            result = await _upload(
                args.website_url,
                args.token,
                {"keywords": [keyword], "source": args.source, "products": chunk},
            )
            job_id = result.get("job_id", "?")
            accepted = result.get("products", len(chunk))
            uploaded += accepted
            log.info("  chunk %d/%d → job #%s (%d products accepted)", cidx, len(chunks), job_id, accepted)
        except Exception as exc:
            log.error("  chunk %d/%d upload failed: %s", cidx, len(chunks), exc)

    return uploaded


async def run_cycle(args, keywords: list, cycle: int) -> None:
    log.info("━━━ Cycle #%d — %d keywords ━━━", cycle, len(keywords))
    total_uploaded = 0

    for idx, keyword in enumerate(keywords, 1):
        try:
            uploaded = await scrape_and_upload_keyword(args, keyword, idx, len(keywords))
            total_uploaded += uploaded
        except Exception as exc:
            log.error("[%d/%d] Failed for %r: %s", idx, len(keywords), keyword, exc)

    log.info("━━━ Cycle #%d done — %d products uploaded ━━━", cycle, total_uploaded)


async def main(argv: Sequence[str] | None = None) -> int:
    args = _arg_parser().parse_args(argv)
    env_keywords = _csv(os.getenv("SCAN_KEYWORDS", ""))
    keywords = args.keywords if args.keywords is not None else env_keywords

    missing = []
    if not args.website_url:  missing.append("WEBSITE_URL")
    if not args.token:        missing.append("INGEST_API_TOKEN")
    if not args.username:     missing.append("CSSBUY_USERNAME")
    if not args.password:     missing.append("CSSBUY_PASSWORD")
    if not keywords:          missing.append("SCAN_KEYWORDS or --keywords")
    if missing:
        print("Missing: " + ", ".join(missing), file=sys.stderr)
        return 2

    cycle = 0
    while True:
        cycle += 1
        try:
            await run_cycle(args, keywords, cycle)
        except Exception as exc:
            log.error("Cycle #%d crashed: %s", cycle, exc)

        if args.interval <= 0:
            break

        log.info("Sleeping %ds before next cycle. Ctrl+C to stop.", args.interval)
        try:
            await asyncio.sleep(args.interval)
        except asyncio.CancelledError:
            break

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main()))
    except KeyboardInterrupt:
        log.info("Stopped.")
        raise SystemExit(0)
