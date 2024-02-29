# BikeSpace API
This is the code repository for the BikeSpace API component.

## Prerequisites

To develop the API locally you'll require the following things:
 - Python version 3.9 or greater
 - Postgres database running on port 5432, version 15 or greater

## Running the API service locally

The project is setup with [`make`](https://www.gnu.org/software/make/) for convenience of running common commands and building artifacts.

For first time setup of the database you can run the following command:
```shell
make recreate-db
```

