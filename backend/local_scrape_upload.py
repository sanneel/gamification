"""
Run CSSBuy scraping locally and upload the scraped data to the hosted website.

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
  UPLOAD_BATCH_SIZE=100      (upload products in chunks of this size)
  SCRAPE_INTERVAL=3600       (seconds between cycles when looping)
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
    parser = argparse.ArgumentParser(description="Scrape CSSBuy locally and upload products to DropOS.")
    parser.add_argument("--website-url", default=os.getenv("WEBSITE_URL", ""), help="Hosted DropOS website URL")
    parser.add_argument("--token", default=os.getenv("INGEST_API_TOKEN", ""), help="Shared ingest API token")
    parser.add_argument("--keywords", nargs="*", default=None, help="Keywords to scan")
    parser.add_argument("--max-per-keyword", type=int, default=int(os.getenv("MAX_PER_KEYWORD", "100")))
    parser.add_argument("--source", default=os.getenv("CSSBUY_SOURCE", "1688"), choices=("1688", "taobao", "both"))
    parser.add_argument("--username", default=os.getenv("CSSBUY_USERNAME", ""))
    parser.add_argument("--password", default=os.getenv("CSSBUY_PASSWORD", ""))
    parser.add_argument("--captcha-key", default=os.getenv("CAPTCHA_2CAPTCHA_KEY", ""))
    parser.add_argument("--upload-batch", type=int, default=int(os.getenv("UPLOAD_BATCH_SIZE", "100")),
                        help="Upload products in chunks of this size (default 100)")
    parser.add_argument("--interval", type=int, default=int(os.getenv("SCRAPE_INTERVAL", "0")),
                        help="Loop interval in seconds. 0 = run once and exit (default)")
    parser.add_argument(
        "--payload-out",
        default=os.getenv("LOCAL_SCRAPE_PAYLOAD_OUT", "local_scrape_payload.json"),
        help="Where to save scraped products before upload",
    )
    return parser


async def _upload(website_url: str, token: str, payload: dict) -> dict:
    url = website_url.rstrip("/") + "/api/ingest/products"
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})
        if response.status_code >= 400:
            body = response.text.strip()
            raise RuntimeError(f"Upload failed: HTTP {response.status_code} from {url}\n{body[:1000]}")
        return response.json()


async def run_once(args, keywords: list) -> int:
    log.info("Scraping %d keyword(s) from CSSBuy source=%s max=%d",
             len(keywords), args.source, args.max_per_keyword)

    batch_size  = args.upload_batch
    all_products: list = []
    total_uploaded = 0
    kw_count = [0]  # mutable counter for closure

    async def on_keyword_done(keyword: str, products: list) -> None:
        """Called by the scraper immediately after each keyword finishes."""
        nonlocal total_uploaded
        kw_count[0] += 1
        log.info("[%d] Keyword %r done — %d products, uploading in chunk(s) of %d",
                 kw_count[0], keyword, len(products), batch_size)
        all_products.extend(products)

        chunks = [products[i:i + batch_size] for i in range(0, len(products), batch_size)]
        for idx, chunk in enumerate(chunks, 1):
            try:
                result = await _upload(
                    args.website_url,
                    args.token,
                    {"keywords": [keyword], "source": args.source, "products": chunk},
                )
                job_id   = result.get("job_id", "?")
                accepted = result.get("products", len(chunk))
                total_uploaded += accepted
                log.info("  chunk %d/%d → job #%s (%d accepted)", idx, len(chunks), job_id, accepted)
            except Exception as exc:
                log.error("  upload failed chunk %d/%d for %r: %s", idx, len(chunks), keyword, exc)

    # One browser session for all keywords — uploads fire per keyword via callback
    await scraper_cssbuy.scrape(
        list(keywords),
        args.max_per_keyword,
        username=args.username,
        password=args.password,
        captcha_key=args.captcha_key,
        source=args.source,
        on_keyword_done=on_keyword_done,
    )

    log.info("Done — %d product(s) scraped, %d uploaded", len(all_products), total_uploaded)

    if args.payload_out and all_products:
        try:
            Path(args.payload_out).write_text(
                json.dumps({"keywords": list(keywords), "source": args.source,
                            "products": all_products}, ensure_ascii=False),
                encoding="utf-8",
            )
            log.info("Saved full payload to %s", args.payload_out)
        except Exception as exc:
            log.warning("Could not save payload: %s", exc)

    return 0 if all_products else 1


async def main(argv: Sequence[str] | None = None) -> int:
    args = _arg_parser().parse_args(argv)
    env_keywords = _csv(os.getenv("SCAN_KEYWORDS", ""))
    keywords = args.keywords if args.keywords is not None else env_keywords

    missing = []
    if not args.website_url:
        missing.append("WEBSITE_URL")
    if not args.token:
        missing.append("INGEST_API_TOKEN")
    if not args.username:
        missing.append("CSSBUY_USERNAME")
    if not args.password:
        missing.append("CSSBUY_PASSWORD")
    if not keywords:
        missing.append("SCAN_KEYWORDS or --keywords")
    if missing:
        print("Missing required setting(s): " + ", ".join(missing), file=sys.stderr)
        return 2

    if args.interval > 0:
        # Loop mode
        cycle = 0
        while True:
            cycle += 1
            log.info("━━━ Cycle #%d ━━━", cycle)
            try:
                await run_once(args, keywords)
            except Exception as exc:
                log.error("Cycle #%d failed: %s", cycle, exc)
            log.info("Sleeping %ds before next cycle. Ctrl+C to stop.", args.interval)
            try:
                await asyncio.sleep(args.interval)
            except asyncio.CancelledError:
                break
    else:
        # Run once — identical to original script behaviour
        return await run_once(args, keywords)

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main()))
    except KeyboardInterrupt:
        log.info("Stopped by user.")
        raise SystemExit(0)
