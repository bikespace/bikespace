# BikeSpace API
The API service is a python Flask application paired with a Postgres database.

## Prerequisites

To develop the API locally you'll require the following things:
 - Python version 3.12.0 or greater
 - Docker (docker daemon) running to launch Postgres database container
 - Set up local secrets used by flask-security using a `.env` file (see instructions in `/example.env`)

Several tasks (e.g. running the API locally, running certain tests) require a database to be running, but the make targets will take care of launching a Postgres container for you as long as you have Docker running.

To stop the Postgres container, just run `make stop-db`.

## Running the API service

There are various make targets to help run/build tasks.
Running the backend service:
```shell 
$ make dev-api
```
The development server should now be running at `localhost:8000`

## API Docs

The api follows an OpenAPI 3.0 Spec, the spec can be found at `bikespace_api/bikespace_api/static/bikespace-open-api.yaml`. When making changes to the database models, the spec should also be edited manually to match.

The swagger-ui to render the OpenAPI spec can be found at `localhost:8000/api/v2/docs`

## Observing the database directly

There are several options for clients that will allow you to interact with the database. Two examples:

- [Postico](https://eggerapps.at/postico2/)
- [pgAdmin](https://www.pgadmin.org/) - default installed with Postgres

To connect and view:

- Register a connection (localhost:5432 with user `postgres` and password `postgres`)
- On pgAdmin right-click the `bikespace_dev` or `bikespace_test` database and select Refresh. The database tables are under Schemas. You can right-click a table and select View/Edit Data to see the entries.
- On Postico, click on the `bikespace_dev` or `bikespace_test` database and then click on the table in the left-hand menu.


## Troubleshooting - multiple services using port 5432

You may run into this error if you have your own installation of Postgres already running or if there is a Postgres client listening on the 5432 port before the database Docker container launches.

(If you are running Postgres.app, then you can just close the application and the server should stop.)

On macos:

```bash
# list the processes running using the port
# may not include background postgres server if you have it installed
$ lsof -i :5432 

# stop local database, replace $VERSION with what you have installed
# postgres --version may help if you don't know
$ sudo -u postgres pg_ctl -D /Library/PostgreSQL/$VERSION/data stop
```

If `postgres` or `pg_ctl` don't work for you, you might need to add postgres to your `.bash_profile` or `.zshrc` file by adding a line like this (replace 17 with your version number):

```
export PATH="/Library/PostgreSQL/17/bin/:$PATH"
```

## Adding and Testing Database Migrations

In production, migrations are automatically applied on deployment. In development, you will have to create migration scrips and then apply and test them manually.

Creating and applying a migration script:

1. Make and save schema changes, e.g. in `./bikespace_api/bikespace_api/api/models.py`
2. Run `make migrate-db`. (A migration file will be generated, you can optionally add a descriptive title using the docstring at the top.)
3. Run `make upgrade-db` to apply the schema changes to your database.

Testing a migration script:

1. While the api is running for development (e.g. `make dev-api`), run `make downgrade-db`. You should see the database revert to the previous schema.
2. Run `make upgrade-db`. You should see the database update to the newest schema.
3. Perform additional tests to confirm that a migrated database returns the correct results in use.
