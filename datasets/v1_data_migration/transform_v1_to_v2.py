import csv
import json
import ast
from datetime import datetime
import requests
import time

url = "https://api-dev.bikespace.ca/api/v2/submissions"

with open('bikespace_schema_translated_fixed.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
        else:
            payload = {}
            payload["latitude"] = row[1]
            payload["longitude"] = row[2]
            issues = ast.literal_eval(row[3])
            parking_duration = ast.literal_eval(row[4])
            payload["parking_time"] = row[5]
            payload["comments"] = row[6]
            datetime_object = datetime.strptime(row[5], "%Y-%m-%dT%H:%M:%S.%f%z")
            if (len(issues) > 0):
                payload["issues"] = issues
            
            parking_duration = ast.literal_eval(row[4])
            if (len(parking_duration) > 0):
                payload["parking_duration"] = parking_duration[0]
            line_count += 1
            json_payload = json.dumps(payload)
            headers =  {"Content-Type": "application/json"}
            print(f'Posting: {json_payload}')
            response = requests.request("POST", url, json=payload, headers=headers)
            print(response.text)
        print(f'Processed {line_count} lines')
        time.sleep(1)
