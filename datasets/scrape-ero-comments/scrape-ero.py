from bs4 import BeautifulSoup
from urllib.request import urlopen
import ssl
import json
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

#https://ero.ontario.ca/notice/019-9266/comments?comment_body_value=&cid=&field_commenting_on_behalf_of_value=All&page=1
BASE_URL = "https://ero.ontario.ca"
NOTICE_COMMENTS_URL = BASE_URL + "/notice/019-9266/comments"
START_PAGE = 0
END_PAGE = 835

def write_to_json(file_path, dict_to_write):
    with open(file_path, "w") as outfile:
        json.dump(dict_to_write, outfile, indent=4)

def find_comment_link(soup: BeautifulSoup, page: int):
    comments_dict = {}
    json_file = "output/comments-{}.json".format(page)
    for link in soup.find_all('a', href=True, text="Read more"):
        relative_comment_url = link['href']
        relative_comment_url_split = relative_comment_url.split("/")
        comment_id = relative_comment_url_split[2]
        comments_dict[comment_id] = {}
        comments_dict[comment_id]["url"] = relative_comment_url
        print("Parsing comment: {}".format(relative_comment_url))
        comment_url = "{}{}".format(BASE_URL, relative_comment_url)
        comment_page = urlopen(comment_url, context=ctx)
        comment_page_html = comment_page.read().decode("utf-8")
        comment_soup = BeautifulSoup(comment_page_html, "html.parser")
        comment_div = comment_soup.find('div', property ='schema:text', class_ = 'field-item')
        comment_paragraphs = comment_div.find_all('p')

        full_comment = ""
        for paragraph in comment_paragraphs:
            full_comment += paragraph.text.strip() + "\n"

        comments_dict[comment_id]["comment"] = full_comment
    write_to_json(json_file, comments_dict)


for page_number in range(START_PAGE, END_PAGE):
    PAGE_URL = "{}?page={}".format(NOTICE_COMMENTS_URL, page_number)
    print("Scraping {}".format(PAGE_URL))
    base_page = urlopen(PAGE_URL, context=ctx)
    base_page_html = base_page.read().decode("utf-8")
    soup = BeautifulSoup(base_page_html, "html.parser")
    find_comment_link(soup=soup, page=page_number)
    time.sleep(1)
