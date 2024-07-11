from typing import TypedDict

import requests
from requests import Response
from dagster import ConfigurableResource
import geopandas as gpd
import pandas as pd

gpd.options.io_engine = "pyogrio"

BASE_URL = "https://ckan0.cf.opendata.inter.prod-toronto.ca"
PACKAGE_URL = BASE_URL + "/api/3/action/package_show"
LICENSE_DESCRIPTION = "Open Government License - Toronto"
LICENSE_URL = "https://open.toronto.ca/open-data-license/"
CREDIT = "City of Toronto"


class TODResponse(TypedDict):
    gdf: gpd.GeoDataFrame
    metadata: dict


class TorontoOpenDataResource(ConfigurableResource):
    def request_gdf(self, dataset_name, resource_id) -> TODResponse:
        meta_params = {"id": dataset_name}
        meta_all = requests.get(PACKAGE_URL, params=meta_params).json()
        [meta_resource] = [
            rs for rs in meta_all["result"]["resources"] if rs["id"] == resource_id
        ]
        gdf: gpd.GeoDataFrame = (
            gpd.read_file(meta_resource["url"]).replace("None", pd.NA).convert_dtypes()
        )
        return {
            "gdf": gdf,
            "metadata": meta_resource,
        }


TORONTO_WARDS = [
    {"number": "01", "name": "Etobicoke North"},
    {"number": "02", "name": "Etobicoke Centre"},
    {"number": "03", "name": "Etobicoke-Lakeshore"},
    {"number": "04", "name": "Parkdale-High Park"},
    {"number": "05", "name": "York South-Weston"},
    {"number": "06", "name": "York Centre"},
    {"number": "07", "name": "Humber River-Black Creek"},
    {"number": "08", "name": "Eglinton-Lawrence"},
    {"number": "09", "name": "Davenport"},
    {"number": "10", "name": "Spadina-Fort York"},
    {"number": "11", "name": "University-Rosedale"},
    {"number": "12", "name": "Toronto-St. Paul's"},
    {"number": "13", "name": "Toronto Centre"},
    {"number": "14", "name": "Toronto-Danforth"},
    {"number": "15", "name": "Don Valley West"},
    {"number": "16", "name": "Don Valley East"},
    {"number": "17", "name": "Don Valley North"},
    {"number": "18", "name": "Willowdale"},
    {"number": "19", "name": "Beaches-East York"},
    {"number": "20", "name": "Scarborough Southwest"},
    {"number": "21", "name": "Scarborough Centre"},
    {"number": "22", "name": "Scarborough-Agincourt"},
    {"number": "23", "name": "Scarborough North"},
    {"number": "24", "name": "Scarborough-Guildwood"},
    {"number": "25", "name": "Scarborough-Rouge Park"},
]

WARD_INFO = {
    "street_furniture_bicycle_parking": {
        "lookup": {ward["number"]: ward["name"] for ward in TORONTO_WARDS},
    },
    "bicycle_parking_high_capacity_outdoor": {
        "lookup": {ward["name"]: ward["number"] for ward in TORONTO_WARDS},
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
    "25 York St": {
        "description": """MAY BE DEFUNCT - NEEDS CONFIRMATION""",
        "capacity": 0,
    },
    # Victoria Park
    "777 Victoria Park Ave": {
        "description": """Located at the main entrance to Victoria Park Subway Station, the bicycle station offers secure, 24-hour bicycle parking with 52 bicycle parking spaces available on two-tier racks.""",
        "capacity": 52,
    },
    # Union Station
    "97 Front St W": {
        "description": """The Bicycle Station is located on the east side of York Street, just south of Front Street. The facility features [approximately 160] bike racks, a washroom, a change room and  a shower with complimentary towels, and an office where staff can register new members and renew bike station parking plans. Tools and pumps are available for members to perform minor repairs.""",
        "capacity": 168,
    },
    # City Hall / Nathan Phillips Square
    "100 Queen St W": {
        "description": """The Nathan Phillips Square Bicycle Station is located in the underground parking facility at Toronto City Hall, 100 Queen Street West. The facility opened May 6, 2019 and includes 170 bicycle parking spaces, washrooms and showers, and a staff office. To visit the bike station on foot, use the “Squirrel” stairs or elevator, located between the skate rental and the snacks concession, to get to the P1 level of the parking garage, then follow the signs. Once you have access as a Bicycle Station member, you can ride your bike down the vehicle entrance on the north side of Queen St., just east of York St.  You can also wheel your bike down the stair channel on the Pedestrian Southbound Concourse stairway, on the sidewalk near where the food vendor trucks park on Queen Street.""",
        "capacity": 170,
    },
    # Finch West
    "3955 Keele St": {
        "description": """The new TTC station at Finch and Keele features a bicycle station with secure parking for 68 bicycles. The facility opened to the public in October of 2018.""",
        "capacity": 68,
    },
}

ABOUT_SEASONAL = """Seasonality: "[seasonal parking is] typically removed before plowing season (starting December 1), and re-installed in the springtime" source: https://www.toronto.ca/services-payments/streets-parking-transportation/cycling-in-toronto/bicycle-parking/"""
