import json
import ssl
import time
from pathlib import Path
from urllib.request import urlopen
import argparse

import pandas as pd
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# https://ero.ontario.ca/notice/019-9266/comments?comment_body_value=&cid=&field_commenting_on_behalf_of_value=All&page=1
BASE_URL = "https://ero.ontario.ca"
OUTPUT_FOLDER = "output"
REQUEST_THROTTLE = 1  # delay between requests, in seconds

def write_to_json(file_path, dict_to_write):
    with open(file_path, "w") as outfile:
        json.dump(dict_to_write, outfile, indent=4)


def find_comment_link(
    soup: BeautifulSoup,
    page: int,
    output_path: Path,
):
    comments_dict = {}
    json_file = "comments-{}.json".format(page)
    for link in soup.find_all("a", href=True, text="Read more"):
        relative_comment_url = link["href"]
        relative_comment_url_split = relative_comment_url.split("/")
        comment_id = relative_comment_url_split[-1]
        comments_dict[comment_id] = {}
        comments_dict[comment_id]["url"] = relative_comment_url
        print("Parsing comment: {}".format(relative_comment_url))
        comment_url = "{}{}".format(BASE_URL, relative_comment_url)
        comment_page = urlopen(comment_url, context=ctx)
        comment_page_html = comment_page.read().decode("utf-8")
        comment_soup = BeautifulSoup(comment_page_html, "html.parser")
        comment_div = comment_soup.find(
            "div", property="schema:text", class_="field-item"
        )
        comment_paragraphs = comment_div.find_all("p")

        full_comment = ""
        for paragraph in comment_paragraphs:
            full_comment += paragraph.text.strip() + "\n"

        comments_dict[comment_id]["comment"] = full_comment
    write_to_json(output_path / json_file, comments_dict)


def combine_pages(pages_path: Path, output_path: Path):
    """Combines the comments in an output folder into one file, and outputs that file in various formats."""

    # collect and combine comment page files
    comment_pages = [f for f in pages_path.glob("*.json")]
    comment_dfs = [
        pd.read_json(
            f,
            orient="index",
            convert_dates=False,
        ).assign(page_file=f.name)
        for f in comment_pages
    ]
    combined_dfs = pd.concat(comment_dfs).sort_index()

    # output to combined JSON and CSV
    combined_dfs.to_json(
        output_path / f"{pages_path.stem}.json",
        indent=4,
        orient="index",
    )
    combined_dfs.to_csv(output_path / f"{pages_path.stem}.csv")


def scrape_ero_comments(notice_number: str, start_page: int, end_page: int):
    notice_comments_url = BASE_URL + f"/notice/{notice_number}/comments"
    Path(f"{OUTPUT_FOLDER}/ero-{notice_number}-comments").mkdir(parents=True, exist_ok=True)
    output_path = Path(f"{OUTPUT_FOLDER}/ero-{notice_number}-comments")

    for page_number in range(start_page, end_page + 1):
        # skip if page file already saved
        if (output_path / f"comments-{page_number}.json").exists():
            continue

        PAGE_URL = "{}?page={}".format(notice_comments_url, page_number)
        print("Scraping {}".format(PAGE_URL))
        base_page = urlopen(PAGE_URL, context=ctx)
        base_page_html = base_page.read().decode("utf-8")
        soup = BeautifulSoup(base_page_html, "html.parser")
        find_comment_link(soup=soup, page=page_number, output_path=output_path)
        time.sleep(REQUEST_THROTTLE)

    combine_pages(pages_path=output_path, output_path=output_path.parent)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="This tool scrapes all publicly submitted comments on an ERO notice.")
    parser.add_argument('--notice-number', type=str, required=True, help="The ERO notice number")
    parser.add_argument('--start-page', type=int, default=0, help="The page number of the comments to start the scrape from.")
    parser.add_argument('--end-page', type=int, default=0, help="The page number of the comments to end the scrape on.")
    args = parser.parse_args()
    scrape_ero_comments(notice_number=args.notice_number, start_page=args.start_page, end_page=args.end_page)
