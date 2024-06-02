from typing import TypedDict

import requests
from requests import Response
from dagster import ConfigurableResource

BASE_URL = "https://ckan0.cf.opendata.inter.prod-toronto.ca"
PACKAGE_URL = BASE_URL + "/api/3/action/package_show"

class TODResponse(TypedDict):
    response: Response
    metadata: dict

class TorontoOpenDataResource(ConfigurableResource):
  def request(self, dataset_name, resource_name) -> TODResponse:
    meta_params = {"id": dataset_name}
    meta_all = requests.get(PACKAGE_URL, params=meta_params).json()
    [meta_resource] = [
      rs for rs 
      in meta_all['result']['resources'] 
      if rs['id'] == resource_name
    ]
    response = requests.get(meta_resource['url'])
    return {
       "response": response,
       "metadata": meta_resource,
    }