# Bikespace 

This is the code repository for the BikeSpace application. We are running it on the Flask framework paired with a Postgres database.

# Getting started

The repository has only been tested on a Mac OSX machine. We utilize `make` and `python3` for developing the application.
The api service is built using `flask`.

It is recommended to have a python version of 3.9 or higher.

## Database

To successfully run the application locally we also require a Postgres databse running along side the flask application.
Ensure that is running on port `5432` with a database `bikespace_dev` with a default credentials of `postgres:postgres`

## Running the API service

Source code for the backend api service is under `bikespace_backend`, it is a python flask application.
There are various make targets to help run/build tasks.
Running the backend service:
```shell
make run-flask-app
```
The development server should now to be running at `127.0.0.1:8000`

## Running the frontend
Install `gatsby-cli` globally on your machine, following these [instructions](https://www.gatsbyjs.com/docs/tutorial/part-0/#gatsby-cli).
Source code for the frontend service is under `bikespace_frontend`, it is written in typescript with React framework and served with gatsby.
Running the frontend:
```shell
make run-frontend
```

The development frontend server should be running at `127.0.0.1:8080`

## API Docs

The api follows an OpenAPI 3.0 Spec, the spec can be found at `bikespace_api/bikespace_api/static/bikespace-open-api.yaml`

The swagger-ui to render the OpenAPI spec can be found at `127.0.0.1:8000/api/v2/docs`

# Development Workflow

Please when always working on a new feature checkout a new branch from the latest main branch and when submitting Pull Requests please submit PRs to the development branch from the feature branch you are working off.

# Project Strucutre

```
.
├── LICENSE
├── Makefile
├── README.md
├── bikespace_api
│   ├── Procfile
│   ├── bikespace_api
│   ├── fly.toml
│   ├── fly_release.sh
│   ├── instance
│   ├── manage.py
│   ├── migrations
│   └── requirements.txt
├── bikespace_frontend
│   ├── Dockerfile
│   ├── README.md
│   ├── fly.toml
│   ├── gatsby-config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   └── tsconfig.json
├── datasets
│   ├── submissions-2018-2023.json
│   └── v1_data_migration
```