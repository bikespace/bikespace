# ERO comments scraper

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

This scraper scrapes the supplied ERO notice page and downloads all the publicly available comments.

To run navigate to `datasets/scrape-ero-comments/`

You will need [virtualenv](https://virtualenv.pypa.io/en/latest/) if you don't have it installed already.

```bash
# create a virtualenv
python3 -m venv venv

# activate virtualenv
source venv/bin/activate # Linux or Mac
.\venv\Scripts\activate # Windows

# Install dependencies
pip install -r requirements.txt

# Run the scraper
python3 scrape-ero.py
```

You can set the `ERO_NUMBER` in the `scrape-ero.py` for the notice to scrape.
You will also need to set the `START_PAGE` and `END_PAGE` number in the script.
These values can obtained manually just by going to the webpage and clicking the `Last` page and getting the `page=` value on the url bar.

The scraped comments will be outputted to the `output` folder, each page will have it's own json file.

If you need to update the requirements during development, pip install or uninstall the relevant packages, and then run:

```bash
pip freeze > requirements.txt
```