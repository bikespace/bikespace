ROOT_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
ROOT_DIR :=  $(dir $(ROOT_PATH))
BIKESPACE_API_DIR = $(ROOT_DIR)/bikespace_api
BIKESPACE_API_FLY_TOML = $(ROOT_DIR)/$(BIKESPACE_API_DIR)/fly.toml
BIKESPACE_FRONTEND_DIR = $(ROOT_DIR)/bikespace_frontend
BIKESPACE_DB_MIGRATIONS = $(BIKESPACE_API_DIR)/migrations
MANAGE_PY = $(BIKESPACE_API_DIR)/manage.py
PIP = $(ROOT_DIR)/$(VENV)/bin/pip
PYTHON = $(ROOT_DIR)/$(VENV)/bin/python3
PYTHON_VERSION = 3.9
VENV = venv

export APP_SETTINGS = bikespace_api.config.DevelopmentConfig
export DATABASE_URL = postgresql://postgres:postgres@localhost:5432/bikespace_dev
export TEST_DATABASE_URI = postgresql://postgres:postgres@localhost:5432/bikespace_test
export FLASK_DEBUG = true
export FLASK_RUN_PORT = 8000
export GATSBY_BIKESPACE_API_URL = http://localhost:8000/api/v2

setup-py: $(VENV)

clean:
	rm -rf $(VENV)
	cd $(BIKESPACE_FRONTEND_DIR) && npm run clean && rm -rf node_modules

$(VENV): $(BIKESPACE_API_DIR)/requirements.txt
	python$(PYTHON_VERSION) -m venv $(VENV)
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
	$(PYTHON) -m pytest --cov-report= --cov=bikespace_api

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

db-stamp-heads:
	$(PYTHON) $(MANAGE_PY) db stamp heads --directory $(BIKESPACE_DB_MIGRATIONS)

fly-deploy-api:
	cd $(BIKESPACE_API_DIR) && flyctl deploy

run-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run start
	
lint-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run lint

build-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run build

serve-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run serve

test-frontend:
	cd $(BIKESPACE_FRONTEND_DIR) && npm install && npm run test

.PHONY: setup-py clean pip-freeze run-flask-app lint-py seed-db recreate-db fly-deploy-api fly-deploy-frontend run-frontend build-frontend 
