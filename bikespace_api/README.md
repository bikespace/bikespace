# BikeSpace API
The API service is a python Flask application paired with a Postgres database.

## Prerequisites

To develop the API locally you'll require the following things:
 - Python version 3.12.2 or greater
 - Postgres database running on port 5432, version 15 or greater

## Database

To successfully run the API locally we require a Postgres database running along side the Flask application. You will have to install Postgres on your system and run the set-up steps noted below. Once set up, ensure that Postgres is running in port `5432` with an empty database `bikespace_dev` with default credentials of `postgres:postgres` (i.e. username and password are both `postgres`).

Setting up the database:
```shell
#recreates an empty database
make recreate-db

#seed the database with test data
make seed-db
```

## Running the API service

There are various make targets to help run/build tasks.
Running the backend service:
```shell 
$ make run-flask-app
```
The development server should now to be running at `127.0.0.1:8000`

## API Docs

The api follows an OpenAPI 3.0 Spec, the spec can be found at `bikespace_api/bikespace_api/static/bikespace-open-api.yaml`

The swagger-ui to render the OpenAPI spec can be found at `127.0.0.1:8000/api/v2/docs`

## Database Set-Up

These instructions are for setting up the database for use in local development.

### Install Postgres

Download the version of Postgres that matches your system using the links on [postgresql.org](https://www.postgresql.org/).

You should be able to use the default installation options in your installer package:

- When the installer prompts you for the password for the database superuser (`postgres`), enter `postgres`.
- Leave the default port as `5432`.
- You don't need to run stack builder after installation.

### Create and set up the bikespace_dev database

These instructions are for the default pgAdmin app, but you may find other apps like [Postico](https://eggerapps.at/postico2/) easier to use.

In pgAdmin:

- Open the Servers list on the left and enter the password (`postgres`).
- Right-click on Databases, then select Create > Database...
- Database name should be `bikespace_dev`; select Save to create.

In a terminal (in the root folder of the repo):

- run `$ make recreate-db` to create the table(s) used by the API.
- run `$ make seed-db` to enter dummy data to be used during development.

To see the results of these actions in pgAdmin, right-click the `bikespace_dev` database and select Refresh. The database tables are under Schemas. You can right-click a table and select View/Edit Data to see the entries.

To test the API is working with the database:

- In a terminal, run `$ make run-flask-app` and navigate to the local url it runs on (usually http://127.0.0.1:8000) to open the Swagger UI page.
- On the Swagger page, you can open GET and select "Try it out" - if everything is working correctly, the API should return the dummy data.
- If you run the frontend application (`$ make run-frontend` in a separate terminal) and use it to make a new submission, you should be able to see it by making another GET request to the API or re-executing the table view in pgAdmin.

