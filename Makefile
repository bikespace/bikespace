ROOT_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
ROOT_DIR :=  $(dir $(ROOT_PATH))
BIKESPACE_API_DIR = $(ROOT_DIR)bikespace_api
BIKESPACE_API_FLY_TOML = $(ROOT_DIR)/$(BIKESPACE_API_DIR)/fly.toml
BIKESPACE_FRONTEND_DIR = $(ROOT_DIR)/bikespace_frontend
BIKESPACE_DASHBOARD_DIR = $(ROOT_DIR)/bikespace_dashboard
BIKESPACE_DB_MIGRATIONS = $(BIKESPACE_API_DIR)/migrations
MANAGE_PY = $(BIKESPACE_API_DIR)/manage.py
PIP = $(ROOT_DIR)$(VENV)/bin/pip
PYTHON = $(ROOT_DIR)$(VENV)/bin/python3
PYTHON_VERSION = 3.12.0
MIN_PYTHON_VERSION = 3.12.0
CURR_PYTHON_VERSION := $(shell python3 -c 'import platform; print(platform.python_version())')
LOWEST_PYTHON_VERSION := $(shell printf '%s\n' $(MIN_PYTHON_VERSION) $(CURR_PYTHON_VERSION) | sort -V | head -n1)
VENV = venv

export APP_SETTINGS = bikespace_api.config.DevelopmentConfig
export DATABASE_URL = postgresql://postgres:postgres@localhost:5432/bikespace_dev
export TEST_DATABASE_URI = postgresql://postgres:postgres@localhost:5432/bikespace_test
export FLASK_DEBUG = true
export FLASK_RUN_PORT = 8000
export GATSBY_BIKESPACE_API_URL = http://localhost:8000/api/v2

setup-py: $(VENV)

.PHONY: check-python-version
check-python-version: 
ifeq ($(LOWEST_PYTHON_VERSION), $(MIN_PYTHON_VERSION))
	@echo "Installed Python version is equal or greater than $(MIN_PYTHON_VERSION)"
else
	$(error "Installed Python version $(CURR_PYTHON_VERSION) is less than the required minimum version of $(MIN_PYTHON_VERSION)")
endif

clean:
	rm -rf $(VENV)
	cd $(BIKESPACE_FRONTEND_DIR) && rm -rf node_modules && rm -rf .next && rm -rf build && rm -rf out && rm -rf coverage

$(VENV): check-python-version $(BIKESPACE_API_DIR)/requirements.txt
	python3 -m venv $(VENV)
	. $(VENV)/bin/activate
	$(PIP) install -r $(BIKESPACE_API_DIR)/requirements.txt
	touch $(VENV)

pip-freeze: $(BIKESPACE_API_DIR)/requirements.txt
	$(PIP) freeze > $(BIKESPACE_API_DIR)/requirements.txt

run-flask-app: setup-py
	export APP_SETTINGS=bikespace_api.config.DevelopmentConfig && \
	export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bikespace_dev && \
	export FLASK_DEBUG=true && \
	export FLASK_RUN_PORT=8000 && \
	$(PYTHON) $(MANAGE_PY) run

run-pytest: setup-py
	export APP_SETTINGS=bikespace_api.config.TestingConfig && \
	export TEST_DATABASE_URI=postgresql://postgres:postgres@localhost:5432/bikespace_test && \
	cd $(BIKESPACE_API_DIR) && \
	$(PYTHON) $(MANAGE_PY) recreate-db && \
	$(PYTHON) $(MANAGE_PY) seed-db && \
	$(PYTHON) -m pytest --cov=bikespace_api --cov-report lcov

run-pytest-terminal: setup-py
	export APP_SETTINGS=bikespace_api.config.TestingConfig && \
	export TEST_DATABASE_URI=postgresql://postgres:postgres@localhost:5432/bikespace_test && \
	cd $(BIKESPACE_API_DIR) && \
	$(PYTHON) $(MANAGE_PY) recreate-db && \
	$(PYTHON) $(MANAGE_PY) seed-db && \
	$(PYTHON) -m pytest -s --cov=bikespace_api --cov-report term

lint-py:
	$(PYTHON) -m black $(BIKESPACE_API_DIR)

seed-db: setup-py
	$(PYTHON) $(MANAGE_PY) seed-db

recreate-db: setup-py
	$(PYTHON) $(MANAGE_PY) recreate-db

init-db: setup-py 
	$(PYTHON) $(MANAGE_PY) db init --directory $(BIKESPACE_DB_MIGRATIONS)

migrate-db: 
	$(PYTHON) $(MANAGE_PY) db migrate --directory $(BIKESPACE_DB_MIGRATIONS)

upgrade-db:
	$(PYTHON) $(MANAGE_PY) db upgrade --directory $(BIKESPACE_DB_MIGRATIONS)

db-history:
	$(PYTHON) $(MANAGE_PY) db history --directory $(BIKESPACE_DB_MIGRATIONS)

db-merge-heads:
	$(PYTHON) $(MANAGE_PY) db merge heads -m "Merge heads" --directory $(BIKESPACE_DB_MIGRATIONS)

db-stamp-heads:
	$(PYTHON) $(MANAGE_PY) db stamp heads --directory $(BIKESPACE_DB_MIGRATIONS)

fly-deploy-api:
	cd $(BIKESPACE_API_DIR) && flyctl deploy

run-frontend: build-frontend
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run start

dev-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run develop
	
lint-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run lint

lint-and-fix-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run fix

build-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run build
	
lint-dashboard:
	cd $(BIKESPACE_DASHBOARD_DIR) && npm install && npm run lint

lint-and-fix-dashboard:
	cd $(BIKESPACE_DASHBOARD_DIR) && npm install && npm run fix

test-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run test

e2e-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && \
	npx playwright install --with-deps && \
	npx playwright test

.PHONY: setup-py clean pip-freeze run-flask-app lint-py seed-db recreate-db fly-deploy-api fly-deploy-frontend run-frontend build-frontend 
