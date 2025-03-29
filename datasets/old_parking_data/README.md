# Old Parking Data

## Background

Circa summer 2018, it appears that the City of Toronto provided BikeSpace with data on bicycle parking locations. Many of the data points appear to be unique, even compared to the City's data currently available (as of writing, in March 2025) and data available in OpenStreetMap. The only data source currently available to BikeSpace volunteers is the MapBox style that includes the data points.

The two main hypotheses for why there is data in this old dataset that is not in any current data source:

1. The bicycle parking has since been moved/removed; and/or
2. The bicycle parking was privately owned and maintained; in 2018, the City included these in its datasets, but by 2025, it had at some point removed them.

To help indicate areas where surveying may be required to add in bike parking from the old dataset that may still exist, the data was extracted from the MapBox style and saved to `old_parking_data.csv`. 

Due to compression at high zoom levels, there is a degradation in precision of a couple metres compared to viewing the data on a live MapBox map where the layer data is re-requested for each move of the map.

## Script

Run as follows using uv for python:

```bash
uv run analyze_old_parking_data.py
```

The script does the following things:

- Generate a geojson file from the csv of older parking data
- Generate a geojson file of only the older parking data that is NOT within 30 metres of a currently-known bicycle parking location

The purpose of the second file is to help identify areas to survey to determine if there is bicycle parking that should be added to OpenStreetMap.
