# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Overview

BikeSpace is a web app for reporting bicycle parking issues in Toronto. It has two main components:
- **`bikespace_api/`** — Python/Flask REST API backed by PostgreSQL
- **`bikespace_frontend/`** — React/TypeScript frontend using Next.js (static export)

The root `Makefile` is the central entry point for all dev, test, and deployment tasks. **The project directory path must contain no spaces** (Makefile requirement).

## Common Commands

All commands run from the repo root unless noted.

### API

```bash
make dev-api              # Start Flask API at http://localhost:8000 (uses Docker for Postgres)
make dev-api-stop         # Stop API Docker containers
make test-api             # Run all API tests with coverage
make test-api-terminal    # Run API tests with terminal coverage output
make lint-py              # Format Python with Black
make migrate-db           # Generate a new Alembic migration
make upgrade-db           # Apply pending migrations
make downgrade-db         # Revert last migration
```

Single API test:
```bash
cd bikespace_api && ../venv/bin/python3 -m pytest path/to/test_file.py -v
```

### Frontend

```bash
make dev-frontend         # Start Next.js dev server at http://localhost:8080
make test-frontend        # Run Jest unit tests
make lint-frontend        # Run ESLint
make lint-and-fix-frontend
```

Single frontend test:
```bash
cd bikespace_frontend && npx jest --coverage=false path/to/test_file.test.tsx
# Date/time tests need timezone set:
TZ='America/Toronto' npx jest --coverage=false path/to/test_file.test.tsx
```

### E2E Tests

```bash
make test-e2e             # Run Playwright tests (requires both dev servers running)
```

E2E tests run against test servers on ports 8001 (API) and 8081 (frontend). They are started automatically by playwright using `make dev-api-test` and `make dev-frontend-test`.

## Architecture

### API (`bikespace_api/`)

- **App factory**: `bikespace_api/__init__.py` — creates Flask app, registers blueprints, sets up SQLAlchemy and Flask-Admin
- **Config**: `bikespace_api/config.py` — `DevelopmentConfig`, `TestingConfig`, `ProductionConfig`
- **Submissions module** (`bikespace_api/submissions/`): core domain — models, routes (Flask-smorest blueprint), Flask-Admin views, and tests
- **Admin module** (`bikespace_api/admin/`): Flask-Security user/role models and admin UI views
- **Routes**: All endpoints under `/api/v2/`. OpenAPI docs auto-generated at `/api/v2/docs/`.
- **Migrations**: Alembic via Flask-Migrate in `/migrations/`
- **Test fixtures**: `bikespace_api/conftest.py` — sets up test app, fresh test DB, and client

Databases:
- Dev: `postgres://postgres:postgres@localhost:5432/bikespace_dev`
- Test: `postgres://postgres:postgres@localhost:5432/bikespace_test`

API `.env` requires:
```
BIKESPACE_SECURITY_PASSWORD_SALT=
BIKESPACE_SECRET_KEY=
SEED_USER_EMAIL=
SEED_USER_PASSWORD=
```

### Frontend (`bikespace_frontend/`)

- **Pages**: `src/app/` — Next.js file-based routing with static export (no SSR)
- **Components**: `src/components/` — each component has its own folder, SCSS module, and test file. Key groups:
  - `dashboard/` — filter management and data views
  - `parking-map/` — Leaflet/MapLibre map with filtering
  - `submission/` — multi-step report submission form
  - `shared-ui/` — reusable UI primitives
- **State**: Zustand for client filter state; TanStack React Query for server state; `nuqs` for URL-synced params
- **API calls**: centralized in `src/utils/` or alongside components using React Query hooks
- **Types**: `src/interfaces/` for shared TypeScript types

Frontend env vars (`.env.development`, `.env.production`, `.env.test`):
- `BIKESPACE_API_URL` — API base URL
- `MAPTILER_API_KEY` — optional; falls back to ProtoMaps tiles for Toronto

### E2E Tests (`e2etests/`)

Playwright tests cover the parking map, submission flow, and dashboard. Config: `e2etests/playwright.config.ts`. Targets Chrome, Firefox, Safari, and Mobile Safari.

## Deployment

- **API**: Fly.io (`yyz` region) — triggered by push to `main` via `.github/workflows/deploy-to-fly.yml`
- **Frontend**: Cloudflare Pages (static export) — preview deployed on PRs via `.github/workflows/test-preview.yml`
