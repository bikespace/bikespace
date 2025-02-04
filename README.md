# Bikespace 
[![Coverage Status](https://coveralls.io/repos/github/bikespace/bikespace/badge.svg?branch=main)](https://coveralls.io/github/bikespace/bikespace?branch=main)

## About Us

BikeSpace is a community-built web app that lets people report the issues they find when trying to park their bikes in the City of Toronto. For more about the project, please see [bikespace.ca](https://bikespace.ca/).

## Project Structure

The BikeSpace application has 2 major components: the backend API, and the frontend (which includes both the submission form and the dashboard).
They are split up accordingly into their own directories:
- `/bikespace_api` (url: [api-dev.bikespace.ca](https://api-dev.bikespace.ca/api/v2/docs))
- `/bikespace_frontend` (url: [bikespace.ca](https://bikespace.ca))

To run any of these components please see the `README` in each directory.

This repository also has a `/datasets` folder for miscellaneous project data. The `/bikespace_dashboard` and `/bikespace_frontend` folders are deprecated and will be removed in the future.


# Development Workflow

- When working on a new feature, please always check out a new branch from the latest main branch.
- When submitting Pull Requests, please submit PRs to the development branch from the feature branch you are working off of.
- Squash and merge is preferred for approved pull requests to keep a clean history of project changes.

For more information about contributing to the BikeSpace project, please read the [Get Involved](https://bikespace.ca/about#get_involved) section of our website.

# Using Make Targets

Most development tasks in this repository (e.g. running apps, linting code) can be run using [`make`](https://en.wikipedia.org/wiki/Make_(software)) targets that simplify multiple steps into one command and work cross-platform. For example, to run `bikespace_frontend` locally while developing, you can run the following in a terminal:

```bash
$ make dev-frontend
```

Note that you may need to ensure that there are no spaces in the filepath for the project directory for the `make` command to work as intended.
