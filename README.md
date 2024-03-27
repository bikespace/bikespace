# Bikespace 
[![Coverage Status](https://coveralls.io/repos/github/bikespace/bikespace-v2/badge.svg?branch=main)](https://coveralls.io/github/bikespace/bikespace-v2?branch=main)

## About Us

BikeSpace is a community-built web app that lets people report the issues they find when trying to park their bikes in the City of Toronto. For more about the project, please see [bikespace.ca](https://bikespace.ca/).

## Project Structure

The BikeSpace application has 3 major components the backend API, the frontend and the dashboard.
They are split up accordingly into their own directories:
- `bikespace_api` (see: [api-dev.bikespace.ca](https://api-dev.bikespace.ca/api/v2/docs))
- `bikespace_frontend` ([app.bikespace.ca](https://dashboard.bikespace.ca/))
- `bikespace_dashboard` ([dashboard.bikespace.ca](https://dashboard.bikespace.ca/))

To run any of these components please see the `README` in each directory.

This repository also has a `bikespace_landing_page` folder for the [bikespace.ca](https://bikespace.ca/) content.

# Development Workflow

- When working on a new feature, please always check out a new branch from the latest main branch
- When submitting Pull Requests, please submit PRs to the development branch from the feature branch you are working off
- Squash and merge is preferred for approved pull requests to keep a clean history of project changes

For more information about contributing to the BikeSpace project, please read the [Get Involved](https://bikespace.ca/#get_involved) section of our website.

# Project Structure

```
.
├── LICENSE
├── Makefile
├── README.md
├── bikespace_api
│   ├── Procfile
│   ├── README.md
│   ├── bikespace_api
│   ├── fly.toml
│   ├── fly_release.sh
│   ├── manage.py
│   ├── migrations
│   └── requirements.txt
├── bikespace_dashboard
│   ├── README.md
│   ├── assets
│   ├── css
│   ├── index.html
│   ├── js
│   ├── libraries
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── bikespace_frontend
│   ├── README.md
│   ├── __mocks__
│   ├── __tests__
│   ├── build
│   ├── coverage
│   ├── gatsby-config.ts
│   ├── jest-preprocess.js
│   ├── jest.config.js
│   ├── loadershim.js
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   ├── setup-test-env.js
│   ├── src
│   └── tsconfig.json
├── bikespace_landing_page
│   ├── ParkingMap.html
│   ├── assets
│   ├── css
│   ├── index.html
│   ├── js
│   └── vendor
├── datasets
│   ├── convert_to_geojson.py
│   ├── submissions-2018-2023.geojson
│   ├── submissions-2018-2023.json
│   ├── submissions-2023-11-21.geojson
│   ├── submissions-2023-11-21.json
│   ├── submissions-2023-11-29.geojson
│   ├── submissions-2023-11-29.json
│   └── v1_data_migration
```