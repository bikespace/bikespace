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

BASE_URL = "https://ero.ontario.ca"
# Search for notices 'Closed' for comments and Notice Stage at 'Decision'
#https://ero.ontario.ca/search?search=&f%5B0%5D=comment_period%3A1&f%5B1%5D=ero_notice_stage%3A2&date%5Bmin%5D=&date%5Bmax%5D=&page=0
SEARCH_URL_PARAMS = '/search?search=&f%5B0%5D=comment_period%3A1&f%5B1%5D=ero_notice_stage%3A2&date%5Bmin%5D=&date%5Bmax%5D='
REQUEST_THROTTLE = 1

def write_to_json(file_path, dict_to_write):
    with open(file_path, "w") as outfile:
        json.dump(dict_to_write, outfile, indent=4)

def get_comments_count(
        soup: BeautifulSoup,
        page: int,
        output_path: Path,):
    notices_dict = {}
    json_file = "notice-comment-count-{}.json".format(page)
    for notice in soup:
        notice_link = notice.find('a', href=True)
        notice_number = notice_link['href'].split('/')[-1]
        notice_title = notice.find('span', class_='field-wrapper')
        notices_dict[notice_number] = {}
        notices_dict[notice_number]['url'] = notice_link['href']
        notices_dict[notice_number]['title'] = notice_title.text.strip()
        print(f"Parsing notice {notice_link['href']}")
        notice_url = f"{BASE_URL}{notice_link['href']}"
        notice_page = urlopen(notice_url, context=ctx)
        notice_page_html = notice_page.read().decode("utf-8")
        notice_page_soup = BeautifulSoup(notice_page_html, "html.parser")
        comments_received_stats = notice_page_soup.find('div', class_='comments-received-stats')
        comments_stats_divs = comments_received_stats.find_all('div')
        for comments_stats_div in comments_stats_divs:
            comments_submitted_method = ""
            for child in comments_stats_div.findChildren():
                if (child.name == 'h3' and child.text.strip() == 'Through the registry'):
                    comments_submitted_method = 'comments_from_registry'
                elif (child.name == 'h3' and child.text.strip() == 'By email'):
                    comments_submitted_method = 'comments_by_email'
                elif (child.name == 'h3' and child.text.strip() == 'By mail'):
                    comments_submitted_method = 'comments_by_mail'
                elif (child.name == 'span'):
                    notices_dict[notice_number][comments_submitted_method] = int(child.text.strip().replace(',', ''))
                else:
                    continue
    write_to_json(output_path / json_file, notices_dict)

def scrape_notices_comment_count(start_page: int, end_page: int, output_path: str):
    Path(f"{output_path}").mkdir(parents=True, exist_ok=True)
    notices_comments_count_output_path = Path(f"{output_path}")
    for page_number in range(start_page, end_page + 1):
        print(f"Parsing page: {page_number}")
        PAGE_URL = f"{BASE_URL}{SEARCH_URL_PARAMS}&page={page_number}"
        print(f"Scraping {PAGE_URL}")
        base_page = urlopen(PAGE_URL, context=ctx)
        base_page_html = base_page.read().decode("utf-8")
        soup = BeautifulSoup(base_page_html, "html.parser")
        notice_titles = soup.find_all('div', class_='view-mode-search_teaser')
        get_comments_count(notice_titles, page_number, notices_comments_count_output_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape comments count on all ERO notices.")
    parser.add_argument('--output-path', type=str, required=True, help='The path of the directory for the scraped data to be written to')
    parser.add_argument('--start-page', type=int, default=0, help="The page number of the ero notices page to start the scrape from")
    parser.add_argument('--end-page', type=int, default=0, help="The page number of the ero notices page to end the scrape on")
    args = parser.parse_args()
    scrape_notices_comment_count(args.start_page, args.end_page, args.output_path)
