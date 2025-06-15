ROOT_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
ROOT_DIR :=  $(dir $(ROOT_PATH))
BIKESPACE_API_DIR = $(ROOT_DIR)bikespace_api
BIKESPACE_API_FLY_TOML = $(ROOT_DIR)/$(BIKESPACE_API_DIR)/fly.toml
BIKESPACE_FRONTEND_DIR = $(ROOT_DIR)/bikespace_frontend
BIKESPACE_DB_MIGRATIONS = $(BIKESPACE_API_DIR)/migrations
MANAGE_PY = $(BIKESPACE_API_DIR)/manage.py
PIP = $(ROOT_DIR)$(VENV)/bin/pip
PYTHON = $(ROOT_DIR)$(VENV)/bin/python3
PYTHON_VERSION = 3.12.0
MIN_PYTHON_VERSION = 3.12.0
CURR_PYTHON_VERSION := $(shell python3 -c 'import platform; print(platform.python_version())')
LOWEST_PYTHON_VERSION := $(shell printf '%s\n' $(MIN_PYTHON_VERSION) $(CURR_PYTHON_VERSION) | sort -V | head -n1)
VENV = venv

# used by github actions; will be overridden if already set in the environment
CI ?= false

export APP_SETTINGS = bikespace_api.config.DevelopmentConfig
export DATABASE_URL = postgresql://postgres:postgres@localhost:5432/bikespace_dev
export TEST_DATABASE_URI = postgresql://postgres:postgres@localhost:5432/bikespace_test
export FLASK_DEBUG = true
export FLASK_RUN_PORT = 8000

.PHONY: setup-py
setup-py: $(VENV)

.PHONY: check-python-version
check-python-version: 
ifeq ($(LOWEST_PYTHON_VERSION), $(MIN_PYTHON_VERSION))
	@echo "Installed Python version is equal or greater than $(MIN_PYTHON_VERSION)"
else
	$(error "Installed Python version $(CURR_PYTHON_VERSION) is less than the required minimum version of $(MIN_PYTHON_VERSION)")
endif

.PHONY: clean
clean:
	rm -rf $(VENV)
	cd $(BIKESPACE_FRONTEND_DIR) && rm -rf node_modules && rm -rf .next && rm -rf build && rm -rf out && rm -rf coverage

$(VENV): check-python-version $(BIKESPACE_API_DIR)/requirements.txt
	python3 -m venv $(VENV)
	. $(VENV)/bin/activate
	$(PIP) install -r $(BIKESPACE_API_DIR)/requirements.txt
	touch $(VENV)

.PHONY: pip-freeze
pip-freeze: $(BIKESPACE_API_DIR)/requirements.txt
	$(PIP) freeze > $(BIKESPACE_API_DIR)/requirements.txt

.PHONY: dev-api-stop
dev-api-stop:
	docker compose --file bikespace_api/docker/compose-dev.yaml down

# port 8000
.PHONY: dev-api
dev-api: dev-api-stop
	docker compose --file bikespace_api/docker/compose-dev.yaml up --build --force-recreate

.PHONY: dev-api-test-stop
dev-api-test-stop:
	docker compose --file bikespace_api/docker/compose-test.yaml down

# port 8001
.PHONY: dev-api-test
dev-api-test: dev-api-test-stop
	docker compose --file bikespace_api/docker/compose-test.yaml up --build --force-recreate

.PHONY: prodtest-api-stop
prodtest-api-stop:
	docker compose --file bikespace_api/docker/compose-prodtest.yaml down

# port 8002
.PHONY: prodtest-api
prodtest-api: prodtest-api-stop
	docker compose --file bikespace_api/docker/compose-prodtest.yaml up --build --force-recreate

.PHONY: test-api
test-api: setup-py launch-db db-test-server
	export APP_SETTINGS=bikespace_api.config.TestingConfig && \
	export TEST_DATABASE_URI=postgresql://postgres:postgres@localhost:5432/bikespace_test && \
	cd $(BIKESPACE_API_DIR) && \
	$(PYTHON) $(MANAGE_PY) recreate-db && \
	$(PYTHON) $(MANAGE_PY) db downgrade base --directory $(BIKESPACE_DB_MIGRATIONS) && \
	$(PYTHON) $(MANAGE_PY) db upgrade --directory $(BIKESPACE_DB_MIGRATIONS) && \
	$(PYTHON) $(MANAGE_PY) seed-db && \
	$(PYTHON) -m pytest --cov=bikespace_api --cov-report lcov

.PHONY: test-api-terminal
test-api-terminal: setup-py launch-db db-test-server
	export APP_SETTINGS=bikespace_api.config.TestingConfig && \
	export TEST_DATABASE_URI=postgresql://postgres:postgres@localhost:5432/bikespace_test && \
	cd $(BIKESPACE_API_DIR) && \
	$(PYTHON) $(MANAGE_PY) recreate-db && \
	$(PYTHON) $(MANAGE_PY) db downgrade base --directory $(BIKESPACE_DB_MIGRATIONS) && \
	$(PYTHON) $(MANAGE_PY) db upgrade --directory $(BIKESPACE_DB_MIGRATIONS) && \
	$(PYTHON) $(MANAGE_PY) seed-db && \
	$(PYTHON) -m pytest -s --cov=bikespace_api --cov-report term-missing

.PHONY: lint-py
lint-py:
	$(PYTHON) -m black $(BIKESPACE_API_DIR)

# check if database migrations need to be generated for the API
.PHONY: migrate-test-db
migrate-test-db: setup-py launch-db db-test-server
	export APP_SETTINGS=bikespace_api.config.DevelopmentConfig && \
	export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bikespace_dev && \
	$(PYTHON) $(MANAGE_PY) recreate-db && \
	$(PYTHON) $(MANAGE_PY) db downgrade base --directory $(BIKESPACE_DB_MIGRATIONS) && \
	$(PYTHON) $(MANAGE_PY) db upgrade --directory $(BIKESPACE_DB_MIGRATIONS) && \
	$(PYTHON) $(MANAGE_PY) db check --directory $(BIKESPACE_DB_MIGRATIONS)

# generates a migration script based on the current model definitions
.PHONY: migrate-db
migrate-db: 
	$(PYTHON) $(MANAGE_PY) db migrate --directory $(BIKESPACE_DB_MIGRATIONS)

# applies all the migration scripts to update the database to the newest schema
.PHONY: upgrade-db
upgrade-db:
	$(PYTHON) $(MANAGE_PY) db upgrade --directory $(BIKESPACE_DB_MIGRATIONS)

# reverts migration by one step (run multiple times if needed)
.PHONY: downgrade-db
downgrade-db:
	$(PYTHON) $(MANAGE_PY) db downgrade --directory $(BIKESPACE_DB_MIGRATIONS)

.PHONY: db-history
db-history:
	$(PYTHON) $(MANAGE_PY) db history --directory $(BIKESPACE_DB_MIGRATIONS)

.PHONY: db-merge-heads
db-merge-heads:
	$(PYTHON) $(MANAGE_PY) db merge heads -m "Merge heads" --directory $(BIKESPACE_DB_MIGRATIONS)

# Tells the database that it is on the most recent migration
.PHONY: db-stamp-heads
db-stamp-heads:
	$(PYTHON) $(MANAGE_PY) db stamp heads --directory $(BIKESPACE_DB_MIGRATIONS)

# Run a postgres Docker container unless in CI environment
.PHONY: launch-db
launch-db:
ifneq ($(CI),true)
	docker start bikespace_db || docker run --name bikespace_db \
	--detach --rm \
	--env POSTGRES_USER=postgres \
	--env POSTGRES_PASSWORD=postgres \
	-p 5432:5432 \
	postgres
endif

.PHONY: stop-db
stop-db:
	docker stop bikespace_db

# Confirm that a postgres server is running at localhost:5432. Retries until timeout.
.PHONY: db-test-server
db-test-server: setup-py
	$(PYTHON) $(MANAGE_PY) test-db-server

.PHONY: fly-deploy-api
fly-deploy-api:
	cd $(BIKESPACE_API_DIR) && flyctl deploy

.PHONY: run-frontend
run-frontend: build-frontend
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run start

.PHONY: dev-frontend
dev-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run develop

.PHONY: dev-frontend-test
dev-frontend-test:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run develop-test
	
.PHONY: lint-frontend
lint-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run lint

.PHONY: lint-and-fix-frontend
lint-and-fix-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run fix

.PHONY: build-frontend
build-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run build

.PHONY: test-frontend
test-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run test

# requires Inkscape to be installed; see instructions in split_icons.py
.PHONY: split-svgs
split-svgs:
	cd $(BIKESPACE_FRONTEND_DIR) && $(PYTHON) icon_tools/split_icons.py

# requires spreet to be installed; see instructions in generate_sprites.py
.PHONY: generate-sprites
generate-sprites:
	cd $(BIKESPACE_FRONTEND_DIR) && $(PYTHON) icon_tools/generate_sprites.py

.PHONY: test-e2e
test-e2e:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && \
	npx playwright install --with-deps && \
	npx playwright test

.PHONY: test-all
test-all: test-api test-frontend test-e2e

