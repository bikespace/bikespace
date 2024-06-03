from typing import TypedDict

import requests
from requests import Response
from dagster import ConfigurableResource
import geopandas as gpd

BASE_URL = "https://ckan0.cf.opendata.inter.prod-toronto.ca"
PACKAGE_URL = BASE_URL + "/api/3/action/package_show"

class TODResponse(TypedDict):
    gdf: gpd.GeoDataFrame
    metadata: dict

class TorontoOpenDataResource(ConfigurableResource):
  def request_gdf(self, dataset_name, resource_name) -> TODResponse:
    meta_params = {"id": dataset_name}
    meta_all = requests.get(PACKAGE_URL, params=meta_params).json()
    [meta_resource] = [
      rs for rs 
      in meta_all['result']['resources'] 
      if rs['id'] == resource_name
    ]
    gdf: gpd.GeoDataFrame = gpd.read_file(meta_resource['url'])
    return {
       "gdf": gdf,
       "metadata": meta_resource,
    }