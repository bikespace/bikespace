import json
import ssl
import time
from pathlib import Path
from urllib.request import urlopen
import argparse

import pandas as pd
from bs4 import BeautifulSoup

# Logging with Rich
import logging
from rich.logging import RichHandler
from rich.progress import (
    Progress,
    SpinnerColumn,
    TextColumn,
    BarColumn,
    TimeElapsedColumn,
    TimeRemainingColumn,
)

logging.basicConfig(
    level="INFO",
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler()],
)
logger = logging.getLogger(__name__)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://ero.ontario.ca"
REQUEST_THROTTLE = 1  # delay between requests in seconds

def write_to_json(file_path, dict_to_write):
    with open(file_path, "w") as outfile:
        json.dump(dict_to_write, outfile, indent=4)

def find_comment_link(soup: BeautifulSoup, page: int, output_path: Path) -> bool:
    """
    Returns True if comments were found and saved, False if no comments were found.
    """
    comments_dict = {}
    for link in soup.find_all("a", href=True, text="Read more"):
        relative_comment_url = link["href"]
        comment_id = relative_comment_url.split("/")[-1]
        comments_dict[comment_id] = {"url": relative_comment_url}

        comment_url = f"{BASE_URL}{relative_comment_url}"
        comment_page = urlopen(comment_url, context=ctx)
        comment_html = comment_page.read().decode("utf-8")
        comment_soup = BeautifulSoup(comment_html, "html.parser")

        comment_div = comment_soup.find("div", property="schema:text", class_="field-item")
        paragraphs = comment_div.find_all("p") if comment_div else []
        full_comment = "\n".join(p.text.strip() for p in paragraphs)

        comments_dict[comment_id]["comment"] = full_comment

    if not comments_dict:
        return False  # No comments found on this page

    # Only write to JSON if we found comments
    json_file = f"comments-{page}.json"
    write_to_json(output_path / json_file, comments_dict)
    return True

def scrape_ero_comments(notice_number: str, output_path: str):
    notice_url = f"{BASE_URL}/notice/{notice_number}/comments"
    output_dir = Path(output_path) / f"ero-{notice_number}-comments"
    output_dir.mkdir(parents=True, exist_ok=True)

    page_number = 0  # Start from page 0 as requested
    while True:
        try:
            page_url = f"{notice_url}?page={page_number}"
            logger.info(f"Scraping {page_url}...")

            base_page = urlopen(page_url, context=ctx)
            soup = BeautifulSoup(base_page.read().decode("utf-8"), "html.parser")

            has_comments = find_comment_link(soup=soup, page=page_number, output_path=output_dir)
            if not has_comments:
                logger.info(
                    f"No more comments found on page {page_number}, stopping ERO {notice_number}."
                )
                break

            time.sleep(REQUEST_THROTTLE)
            page_number += 1

        except Exception as e:
            logger.error(
                f"Error or no more pages for {notice_number} (stopped at page {page_number}). Reason: {e}"
            )
            break

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scrapes all publicly submitted comments on one or more ERO notices."
    )
    parser.add_argument("--notice-number", type=str, help="Single ERO notice number.")
    parser.add_argument("--file", type=str, help="Path to file with ERO numbers, one per line.")
    parser.add_argument("--output-path", type=str, required=True, help="Output directory path.")
    args = parser.parse_args()

    if args.file:
        with open(args.file, "r") as f:
            ero_numbers = [line.strip() for line in f if line.strip()]

        # Rich progress bar for multiple ERO numbers
        with Progress(
                SpinnerColumn(),
                TextColumn("[bold]{task.description}"),
                BarColumn(),
                TimeElapsedColumn(),
                "ETA:",
                TimeRemainingColumn(),
        ) as progress:
            ero_task = progress.add_task("Scraping ERO notices...", total=len(ero_numbers))

            for ero_num in ero_numbers:
                progress.update(ero_task, description=f"Processing ERO {ero_num}")
                scrape_ero_comments(notice_number=ero_num, output_path=args.output_path)
                progress.update(ero_task, advance=1)

    elif args.notice_number:
        logger.info(f"Scraping ERO notice {args.notice_number}...")
        scrape_ero_comments(notice_number=args.notice_number, output_path=args.output_path)
    else:
        logger.error(
            "Please provide either --notice-number or --file containing ERO numbers."
        )
