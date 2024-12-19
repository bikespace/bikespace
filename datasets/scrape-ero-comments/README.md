# ERO comments scraper

## Usage

This scraper scrapes the supplied ero notice page and downloads all the publicly available comments.

To run navigate to `datasets/scrape-ero-comments/`

You will need [virtualenv](https://virtualenv.pypa.io/en/latest/) if you dont' have it installed already

```bash
# create a virtualenv
python3 -m venv venv

# activate virtualenv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt


# Run the scraper
python3 scrape-ero.py
```

You can set the `NOTICE_COMMENTS_URL` in the `scrape-ero.py` for the notice to scrape.
You will also need to set the `START_PAGE` and `END_PAGE` number in the script.
These values can obtained manually just by going to the webpage and clicking the `Last` page and getting the `page=` value on the url bar.

The scraped comments will be outputted to the `output` folder, each page will have it's own json file.