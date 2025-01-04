import json
import ssl
import time
from pathlib import Path
from urllib.request import urlopen

import pandas as pd
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# https://ero.ontario.ca/notice/019-9266/comments?comment_body_value=&cid=&field_commenting_on_behalf_of_value=All&page=1
BASE_URL = "https://ero.ontario.ca"
ERO_NUMBER = "019-9266"
NOTICE_COMMENTS_URL = BASE_URL + f"/notice/{ERO_NUMBER}/comments"
START_PAGE = 0
END_PAGE = 836
REQUEST_THROTTLE = 1  # delay between requests, in seconds
OUTPUT_FOLDER = Path(f"output/ero-{ERO_NUMBER}-comments")


def write_to_json(file_path, dict_to_write):
    with open(file_path, "w") as outfile:
        json.dump(dict_to_write, outfile, indent=4)


def find_comment_link(
    soup: BeautifulSoup,
    page: int,
    output_path: Path = OUTPUT_FOLDER,
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


def scrape_ero(output_path: Path = OUTPUT_FOLDER):
    for page_number in range(START_PAGE, END_PAGE + 1):
        # skip if page file already saved
        if (output_path / f"comments-{page_number}.json").exists():
            continue

        PAGE_URL = "{}?page={}".format(NOTICE_COMMENTS_URL, page_number)
        print("Scraping {}".format(PAGE_URL))
        base_page = urlopen(PAGE_URL, context=ctx)
        base_page_html = base_page.read().decode("utf-8")
        soup = BeautifulSoup(base_page_html, "html.parser")
        find_comment_link(soup=soup, page=page_number)
        time.sleep(REQUEST_THROTTLE)

    combine_pages(pages_path=output_path, output_path=output_path.parent)


if __name__ == "__main__":
    scrape_ero()
