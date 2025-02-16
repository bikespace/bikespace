# ERO scraper

## Background Information - Ontario Bill 212 (2024) Analysis

This scraper was written for comments on two Environmental Registry of Ontario (ERO) consultations regarding Ontario Bill 212. 

Background information on Bill 212:

- [Legislative Assembly of Ontario page for Bill 212](https://www.ola.org/en/legislative-business/bills/parliament-43/session-1/bill-212)
- [CBC (November 25, 2024): Ontario passes bill that allows major Toronto bike lanes to be ripped out](https://www.cbc.ca/news/canada/toronto/bill-212-bike-lanes-highway-413-passes-1.7392821)

The ERO is used specifically for the environmental impacts of legislation and other Ontario government rule-making. There were two ERO consultations related to Bill 212, one for its proposed changes to highway construction and related environmental assessments, and one for its proposed actions and regulations regarding bicycle lanes:

- [019-9265 "Building Highways Faster Act, 2024"](https://ero.ontario.ca/notice/019-9265)
- [019-9266 "Framework for bike lanes that require removal of a traffic lane."](https://ero.ontario.ca/notice/019-9266)

These two topics related to the bill were also posed on the Ontario Regulatory Registry, which is the usual channel for leglative and rule-making consultation with a more general focus (i.e. not just limited to environmental impacts):

- [Ontario Regulatory Registry: Building Highways Faster Act, 2024](https://www.ontariocanada.com/registry/view.do?postingId=48893&language=en)
- [Ontario Regulatory Registry: Framework for bike lanes that require removal of a traffic lane.](https://www.ontariocanada.com/registry/view.do?language=en&postingId=48874)


## Usage

There are two scrapers provided:
- `scrape_ero_notice_comments.py` scrapes the supplied ERO notice page and downloads all the publicly available comments.
- `scrape_ero_notices_comment_count.py` scrapes the comments count and statistics of ERO notices on the ERO website.

To run navigate to `datasets/scrape-ero-comments/`. This script should work with Python 3.12 and above.

You will need [virtualenv](https://virtualenv.pypa.io/en/latest/) if you don't have it installed already.

```bash
# create a virtualenv
python3 -m venv venv

# activate virtualenv
source venv/bin/activate # Linux or Mac
.\venv\Scripts\activate # Windows

# Install dependencies
pip install -r requirements.txt

# Running the scrape_ero_notice_comments scraper
python3 scrape_ero_notice_comments.py --notice-number [ero_notice_number_to_scrape] --output-path [folder_to_output_scraped_files] --start-page [page_to_start_the_scraper_on] --end-page [page_to_end_the_scraper_on]

# Running the scrape_ero_notices_comment_count scraper
python3 scrape_ero_notices_comment_count.py --output-path [folder_to_output_scraped_files] --start-page [page_to_start_the_scraper_on] --end-page [page_to_end_the_scraper_on]
```

You can set the notice number to scrape as an argument `--notice-number` for the `scrape_ero_notice_comments` scraper.
You can also optionally set the start page `--start-page` and end page `--end-page` number in the scraper.

These values can obtained manually just by going to the webpage and clicking the `Last` page and getting the `page=` value on the url bar.

The scraped comments will be outputted to the `--output-path` argument folder, each page will have it's own json file.
To combine the json files for each scraped page, there is a helper script `combine_pages.py`
```bash
# combining the scraped json files
python3 combine_pages.py --pages-path [path_to_all_the_scraped_pages_json_files] --output-path [path_to_output_the_combined_json_files]
```

If you need to update the requirements during development, pip install or uninstall the relevant packages, and then run:

```bash
pip freeze > requirements.txt
```