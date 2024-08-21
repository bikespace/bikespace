# Analysis for City

## Usage

Generate report:
```bash
# all dates
python src/generate_damage_report.py

# only use BikeSpace reports from a specific date range
python src/generate_damage_report.py --date_from YYYY-MM-DD --date_to YYYY-MM-DD
python src/generate_damage_report.py -f YYYY-MM-DD -t YYYY-MM-DD
```

Run tests or lint:
```bash
pytest
black src/
```

## Important Folders:

- `/reports`: output reports go here
- `/references`: data sources to help with report generation
- `/photos`: survey photos for inclusion in the report
- `/thumbnails`: auto-generated map thumbnails
- `/src`: report generation script
