# Bikespace 
[![Coverage Status](https://coveralls.io/repos/github/bikespace/bikespace/badge.svg?branch=main)](https://coveralls.io/github/bikespace/bikespace?branch=main)

## About Us

BikeSpace is a community-built web app that lets people report the issues they find when trying to park their bikes in the City of Toronto. For more about the project, please see [bikespace.ca](https://bikespace.ca/).

## Project Structure

The BikeSpace application has 2 major components: the backend API, and the frontend (which includes both the submission form and the dashboard).
They are split up accordingly into their own directories:
- `/bikespace_api` (url: [api.bikespace.ca](https://api.bikespace.ca/api/v2/docs))
- `/bikespace_frontend` (url: [bikespace.ca](https://bikespace.ca))

To run any of these components please see the `README` in each directory.

## Quick start (Docker)

### Prerequisites

- **Docker** with **Docker Compose v2.20 or newer** (the root `compose.yaml` uses `include:`). Check with `docker compose version`.
  - macOS / Windows: install [Docker Desktop](https://docs.docker.com/desktop/), which includes Compose.
  - Linux: install [Docker Engine](https://docs.docker.com/engine/install/) and the [Compose plugin](https://docs.docker.com/compose/install/linux/).
- **make**. On macOS it comes with the Xcode Command Line Tools (`xcode-select --install`). On Windows, run the commands from a WSL 2 shell.
- Free ports **8000**, **8080** and **25432** on your machine.

Make sure the Docker daemon is running (e.g. Docker Desktop is open) before you start.

### Running the stack

Start the whole stack (Postgres, the API and the frontend) from the repo root with one command:

```bash
$ make dev
```

No host Python or Node install is needed, and no `.env` is required: the dev stack falls back to dev-only secrets. A `bikespace_api/.env` (see `bikespace_api/example.env`) overrides them if present.

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/api/v2/docs/ |
| Admin | http://localhost:8000/admin/ |
| Postgres | `localhost:25432` (user `postgres`, password `devpwd`, db `bikespace_dev`) |

The database is recreated and seeded on every `make dev`. Seeded logins:
- `admin@example.com` / `admin` (superuser)
- `notanadmin@example.com` / `notanadmin` (regular user)
- the seed user, `seedadmin@example.com` / `seedadmin` unless set in `bikespace_api/.env`

Edits to API and frontend source reload automatically. After changing `package-lock.json` or `requirements.txt`, run `make dev` again.

- `make dev-stop` stops the stack. Ctrl-C in the `make dev` terminal also stops it.
- `make dev-clean` also deletes the frontend's cached `node_modules`, `.next` and npm cache volumes.
- If frontend edits don't trigger a reload (e.g. on Windows/WSL), use `WATCHPACK_POLLING=true make dev`.

The per-service targets (`make dev-api`, `make dev-frontend`) still work as before.

This repository also has a `/datasets` folder for miscellaneous project data and an `/archive` folder for code from previous project webpages that are now deprecated.


# Development Workflow

- When working on a new feature, please always check out a new branch from the latest main branch.
- When submitting Pull Requests, please submit PRs to the development branch from the feature branch you are working off of.
- Squash and merge is preferred for approved pull requests to keep a clean history of project changes.

For more information about contributing to the BikeSpace project, please read the [Get Involved](https://bikespace.ca/about#get-involved) section of our website.

# Using Make Targets

Most development tasks in this repository (e.g. running apps, linting code) can be run using [`make`](https://en.wikipedia.org/wiki/Make_(software)) targets that simplify multiple steps into one command and work cross-platform. For example, to run `bikespace_frontend` locally while developing, you can run the following in a terminal:

```bash
$ make dev-frontend
```

Note that you may need to ensure that there are no spaces in the filepath for the project directory for the `make` command to work as intended.
