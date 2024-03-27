# BikeSpace API
The API service is a python Flask application paired with a Postgres database.

## Prerequisites

To develop the API locally you'll require the following things:
 - Python version 3.9.6 or greater
 - Postgres database running on port 5432, version 15 or greater

## Database

To successfully run the api locally we require a Postgres database running along side the Flask application.
Ensure that Postgres is running in port `5432` with an empty database `bikespace_dev` with default credentials of `postgres:postgres`

## Running the API service

There are various make targets to help run/build tasks.
Running the backend service:
```shell 
make run-flask-app
```
The development server should now to be running at `127.0.0.1:8000`

## API Docs

The api follows an OpenAPI 3.0 Spec, the spec can be found at `bikespace_api/bikespace_api/static/bikespace-open-api.yaml`

The swagger-ui to render the OpenAPI spec can be found at `127.0.0.1:8000/api/v2/docs`
