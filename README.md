# Bikespace 
[![Coverage Status](https://coveralls.io/repos/github/bikespace/bikespace-v2/badge.svg?branch=main)](https://coveralls.io/github/bikespace/bikespace-v2?branch=main)

## Project Structure

The BikeSpace application has 3 major components the backend API, the frontend and the dashboard.
They are split up accordingly into their own directories:
- `bikespace_api`
- `bikespace_frontend`
- `bikespace_dashboard`

To run any of these components please see the `README` in each directory.

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