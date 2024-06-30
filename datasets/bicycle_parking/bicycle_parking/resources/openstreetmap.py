from datetime import datetime

from dagster import ConfigurableResource
import requests

CRS = "EPSG:4326"
API_URL = r"http://overpass-api.de/api/interpreter" 

class OpenStreetMapResource(ConfigurableResource):
  def request_query(self, query) -> dict:
    response = requests.post(API_URL, data = query)
    data = response.json()
    data["crs"] = {
      "type": "name",
      "properties": {
        "name": CRS
      }
    }
    return data


VIEW_URL = r"https://www.openstreetmap.org/"
INCLUDE_META = ["type", "id", "version"]

def feature_from_point_element(element: dict) -> dict:
  coords: tuple
  if ("lon" in element and "lat" in element):
    coords = (element['lon'], element['lat'])
  elif ("center" in element):
    coords = (element['center']['lon'], element['center']['lat'])
  else:
    raise KeyError(f"""Unable to find coordinates ("lon", "lat", or "center") in element {element["type"] + "/" + str(element["id"])}""")
  
  meta_properties = {
    "meta_" + key: value
    for (key, value) in element.items()
    if key in INCLUDE_META
  }
  # convert "Z" suffix to "+00:00"
  timestamp = {
    "meta_timestamp": datetime.fromisoformat(element['timestamp']).isoformat(),
  }
  view_url = {
    "meta_url_nwr": VIEW_URL + element['type'] + "/" + str(element['id'])
  }

  return {
    "type": "Feature",
    "properties": {
      **element['tags'],
      **meta_properties,
      **timestamp,
      **view_url,
    },
    "geometry": {
      "type": "Point", 
      "coordinates": coords,
    },
  }
