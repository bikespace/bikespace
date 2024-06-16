from typing import TypedDict

import requests
from requests import Response
from dagster import ConfigurableResource
import geopandas as gpd
import pandas as pd

gpd.options.io_engine = "pyogrio"

BASE_URL = "https://ckan0.cf.opendata.inter.prod-toronto.ca"
PACKAGE_URL = BASE_URL + "/api/3/action/package_show"

class TODResponse(TypedDict):
    gdf: gpd.GeoDataFrame
    metadata: dict

class TorontoOpenDataResource(ConfigurableResource):
  def request_gdf(self, dataset_name, resource_id) -> TODResponse:
    meta_params = {"id": dataset_name}
    meta_all = requests.get(PACKAGE_URL, params=meta_params).json()
    [meta_resource] = [
      rs for rs 
      in meta_all['result']['resources'] 
      if rs['id'] == resource_id
    ]
    gdf: gpd.GeoDataFrame = (gpd
      .read_file(meta_resource['url'])
      .replace("None", pd.NA)
      .convert_dtypes()
    )
    return {
       "gdf": gdf,
       "metadata": meta_resource,
    }

WARD_INFO = {
   "street_furniture_bicycle_parking": {
      "names": {
        "01": "Etobicoke North",
        "02": "Etobicoke Centre",
        "03": "Etobicoke-Lakeshore",
        "04": "Parkdale-High Park",
        "05": "York South-Weston",
        "06": "York Centre",
        "07": "Humber River-Black Creek",
        "08": "Eglinton-Lawrence",
        "09": "Davenport",
        "10": "Spadina-Fort York",
        "11": "University-Rosedale",
        "12": "Toronto-St. Paul’s",
        "13": "Toronto Centre",
        "14": "Toronto-Danforth",
        "15": "Don Valley West",
        "16": "Don Valley East",
        "17": "Don Valley North",
        "18": "Willowdale",
        "19": "Beaches-East York",
        "20": "Scarborough Southwest",
        "21": "Scarborough Centre",
        "22": "Scarborough-Agincourt",
        "23": "Scarborough North",
        "24": "Scarborough-Guildwood",
        "25": "Scarborough-Rouge Park"
      },
   },
   "bicycle_parking_racks": {
      "pattern": r"\s*?(?P<ward_name>.+?)\s*?\(\s*?\d+(?P<ward_number>\d{2})\s*?\)",
   },
   "bicycle_parking_bike_stations_indoor": {
      "pattern": r"\s*?(?P<ward_name>.+?)\s*?\(\s*?\d+(?P<ward_number>\d{2})\s*?\)",
   },
}

# Additional key details derived from the City of Toronto webpage, accessed 2024-06 from https://www.toronto.ca/services-payments/streets-parking-transportation/cycling-in-toronto/bicycle-parking/bicycle-parking-stations/
# key values are 'ADDRESS_FULL'
BIKE_STATION_INFO = {
  # Union Station - Old?
  '25 York St': {
     "description": """MAY BE DEFUNCT - NEEDS CONFIRMATION""",
     "capacity": 0,
  },
  # Victoria Park
  '777 Victoria Park Ave': {
    "description": """Located at the main entrance to Victoria Park Subway Station, the bicycle station offers secure, 24-hour bicycle parking with 52 bicycle parking spaces available on two-tier racks.""",
    "capacity": 52,
  }, 
  # Union Station
  '97 Front St W': {
    "description": """The Bicycle Station is located on the east side of York Street, just south of Front Street. The facility features [approximately 160] bike racks, a washroom, a change room and  a shower with complimentary towels, and an office where staff can register new members and renew bike station parking plans. Tools and pumps are available for members to perform minor repairs.""",
    "capacity": 168,
  },
  # City Hall / Nathan Phillips Square
  '100 Queen St W': {
    "description": """The Nathan Phillips Square Bicycle Station is located in the underground parking facility at Toronto City Hall, 100 Queen Street West. The facility opened May 6, 2019 and includes 170 bicycle parking spaces, washrooms and showers, and a staff office. To visit the bike station on foot, use the “Squirrel” stairs or elevator, located between the skate rental and the snacks concession, to get to the P1 level of the parking garage, then follow the signs. Once you have access as a Bicycle Station member, you can ride your bike down the vehicle entrance on the north side of Queen St., just east of York St.  You can also wheel your bike down the stair channel on the Pedestrian Southbound Concourse stairway, on the sidewalk near where the food vendor trucks park on Queen Street.""",
    "capacity": 170,
  },
  # Finch West  
  '3955 Keele St': {
    "description": """The new TTC station at Finch and Keele features a bicycle station with secure parking for 68 bicycles. The facility opened to the public in October of 2018.""",
    "capacity": 68,
  },
}