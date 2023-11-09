from geojson import Feature, FeatureCollection, Point
import geojson
import json

json_data_file = open("submissions-2018-2023.json")

json_data = json.load(json_data_file)

features = []

for submission in json_data:
    point_feature = Feature(
        geometry=Point((submission["longitude"], submission["latitude"])),
        properties={
            "id": submission["id"],
            "comments": submission["comments"],
            "issues": submission["issues"],
            "parking_duration": submission["parking_duration"],
            "parking_time": submission["parking_time"],
        },
    )
    if (point_feature.is_valid):
        features.append(point_feature)

feature_collection = FeatureCollection(features)
feature_collection.errors()
geojson_dump = geojson.dumps(feature_collection)

with open("submissions-2018-2023.geojson", "w") as output_geojson:
    output_geojson.write(geojson_dump)
