# Analysis for City

## Usage

Make sure to navigate to the `/datasets/analysis-for-city` directory before running commands.

You will need to have [uv](https://docs.astral.sh/uv/) installed to run the script.

Generate report:
```bash
# all dates
$ uv run task generate_report

# only use BikeSpace reports from a specific date range
$ uv run task generate_report --date_from YYYY-MM-DD --date_to YYYY-MM-DD
$ uv run task generate_report -f YYYY-MM-DD -t YYYY-MM-DD

# see also
$ uv run task generate_report --help
```

Run tests or lint:
```bash
$ uv run pytest
$ uv run ruff format
```

## Set Up Notes

- Make sure to update the copy of "BikeSpace Data Notes and Cleanup - Data.csv" in `/references` (In Google Sheets: File > Download > Comma Separated Values > save/over-write to `/references` folder)
- If assets have been newly identified since the last time the script was run, make sure to delete the thumbnails in `/thumbnails` so that they get re-generated (otherwise the old thumbnail will still be used)
- Survey photos should be saved with the bikespace report submission_id, e.g. "1234.jpg" for submission_id # 1234.


## Important Folders:

- `/reports`: output reports go here
- `/references`: data sources to help with report generation
- `/photos`: survey photos for inclusion in the report
- `/thumbnails`: auto-generated map thumbnails
- `/src`: report generation script
