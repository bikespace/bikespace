# Bicycle Parking in Apartments

Cleaned dataset of apartment buildings in the City of Toronto and the amount of bicycle parking available at each building as self-reported via the RentSafeTO program. See below for additional details on data fields and calculations.

## Sources

From City of Toronto Open Data: 

- [Apartment Building Registration ("apartment-building-registration")](https://open.toronto.ca/dataset/apartment-building-registration/): Has data on the number of indoor and outdoor bicycle parking spaces available at a property.
- [Apartment Building Evaluation ("apartment-building-evaluation")](https://open.toronto.ca/dataset/apartment-building-evaluation/): Has data on the geolocation of most properties. (Properties that do not have a geolocation from this dataset are address geocoded using [Nominatim](https://nominatim.org/).)
- [City Wards ("city-wards")](https://open.toronto.ca/dataset/city-wards/): Added as supplemental information for analysis.
- [City Neighbourhoods ("neighbourhoods")](https://open.toronto.ca/dataset/neighbourhoods/): Added as supplemental information for analysis (specifically to distinguish apartments in NIAs and Emerging Neighbourhoods).

Zoning:

- Current zoning regulations for bicycle parking: [Toronto Zoning By-Law, Chapter 230](https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter230.htm)
- Polygon for the "Bicycle Zones" described in section 5.1.10 (11) of Zoning By-Law chapter 230 - `source_data/Toronto_Bicycle_Policy_Zones.geojson`
- Information on [proposed Zoning By-Law changes as of fall 2024](https://www.toronto.ca/city-government/planning-development/planning-studies-initiatives/review-of-parking-requirements-for-new-development/)

## How to run

This project uses [uv](https://github.com/astral-sh/uv) to run the python script and keep dependencies organized.

```bash
# main script to generate data
$ uv run src/apartments/explore.py 

# test running for development
$ uv run pytest PATH_TO_TEST_FILE
```

## Data Features

|     Field                         	|     Source                           	|     Description                                                                                                                                                                                	|
|-----------------------------------	|--------------------------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| BIKE_PARKING                      	| apartment-building-registration      	| Is there a dedicated bike   parking area? If so, how many indoor parking spots are available and how many   outdoor parking spots are available?                                               	|
| CONFIRMED_STOREYS                 	| apartment-building-registration      	| This is the number of storeys in   a building                                                                                                                                                  	|
| CONFIRMED_UNITS                   	| apartment-building-registration      	| This is the number of units in a   building                                                                                                                                                    	|
| PROP_MANAGEMENT_COMPANY_NAME      	| apartment-building-registration      	| What is the name of the company   who manages this property?                                                                                                                                   	|
| PROPERTY_TYPE                     	| apartment-building-registration      	| This field informs users of   whether a building is owned privately, through TCHC or social housing                                                                                            	|
| RSN                               	| apartment-building-registration      	| This is the ID number for the   building. It can be used to identify unique buildings and to match with   future apartment building datasets                                                   	|
| SITE_ADDRESS_x                    	| apartment-building-registration      	| Location of the building                                                                                                                                                                       	|
| WARD                              	| apartment-building-registration      	| This is the ward that the   building is located in.                                                                                                                                            	|
| YEAR_BUILT                        	| apartment-building-registration      	| When was the building built?                                                                                                                                                                   	|
| YEAR_OF_REPLACEMENT               	| apartment-building-registration      	| This is the year that the   elevator was replaced                                                                                                                                              	|
| YEAR_REGISTERED                   	| apartment-building-registration      	| This is the year the building   was registered in the ABS program                                                                                                                              	|
| bike_parking_indoor               	| calculated                           	| Number extracted from   BIKE_PARKING field                                                                                                                                                     	|
| bike_parking_outdoor              	| calculated                           	| Number extracted from   BIKE_PARKING field                                                                                                                                                     	|
| SITE_ADDRESS_y                    	| apartment-building-evaluation        	| Location of the building   (included for error checking - should match SITE_ADDRESS_x)                                                                                                         	|
| LATITUDE                          	| apartment-building-evaluation        	| Latitude coordinate of the   building                                                                                                                                                          	|
| LONGITUDE                         	| apartment-building-evaluation        	| Longitude coordinate of the   building                                                                                                                                                         	|
| geometry                          	| calculated                           	| Shapely Point coordinate for the   building based on data from apartment-building-evaluation or geocoded with   Nominatim if required                                                          	|
| ward_code                         	| city-wards                           	| Ward number, e.g. "4",   "19"                                                                                                                                                                  	|
| ward_name                         	| city-wards                           	| Ward name, e.g.   "Beaches-East York"                                                                                                                                                          	|
| ward_full                         	| city-wards                           	| Ward name and number, e.g.   "Etobicoke Centre (02)"                                                                                                                                           	|
| neighbourhood_number              	| neighbourhoods                       	| Neighbourhood number, e.g.   "54", "164"                                                                                                                                                       	|
| neighbourhood_name                	| neighbourhoods                       	| Neighbourhood name, e.g.   "O'Connor-Parkview"                                                                                                                                                 	|
| neighbourhood_classification      	| neighbourhoods                       	| Toronto Strong Neighbourhoods   Strategy classification description:    "Neighbourhood Improvement Area", "Emerging   Neighbourhood", or "Not an NIA or Emerging Neighbourhood"                	|
| neighbourhood_classification_code 	| neighbourhoods                       	| Toronto Strong Neighbourhoods   Strategy classification code:    "NIA", "EN", or "NA"                                                                                                          	|
| BICYCLE_ZONE                      	| Toronto_Bicycle_Policy_Zones.geojson 	| Polygon for bicycle zones   described in Toronto Zoning By-Law 230.5.1.10 (11)                                                                                                                 	|
| short_term_min                    	| calculated                           	| Number of short-term bicycle   parking spaces required by current zoning by-law if the developer uses the   maximum payment in lieu of bicycle parking (i.e. 50% reduction to formula)         	|
| short_term_max                    	| calculated                           	| Number of short-term bicycle   parking spaces required by current zoning by-law with no payment in lieu of   bicycle parking (i.e. 100% of formula)                                            	|
| long_term                         	| calculated                           	| Number of long-term bicycle   parking spaces required by current zoning by-law                                                                                                                 	|
| short_term_min_unmet              	| calculated                           	| Additional spaces that would   have to be added to meet current short-term minimum requirement. Formula:   (minimum short-term zoning requirement) - (number of short-term spaces   available) 	|
| short_term_max_unmet              	| calculated                           	| Additional spaces that would   have to be added to meet current short-term maximum requirement. Formula:   (maximum short-term zoning requirement) - (number of short-term spaces   available) 	|
| long_term_unmet                   	| calculated                           	| Additional spaces that would   have to be added to meet current long-term    requirement. Formula: (long-term zoning requirement) - (number of   long-term spaces available)                   	|
| total_unmet_min                   	| calculated                           	| Additional spaces that would   have to be added to meet minimum currentshort and long-term  requirements. Formula: short_term_min_unmet   + long_term_unmet                                    	|
| total_req_min                     	| calculated                           	| Minimum short and long-term   spaces required under current zoning by-law. Formula: short_term_min +   long_term                                                                               	|
| pc_unmet                          	| calculated                           	| Percentage of minimum current   by-law requirement not currently provided at the building. Formula:   total_unmet_min / total_req_min                                                          	|

