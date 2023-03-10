BIKESPACE_API_DIR = bikespace_api
MANAGE_PY = $(BIKESPACE_API_DIR)/manage.py
PIP = $(VENV)/bin/pip
PYTHON = $(VENV)/bin/python3
PYTHON_VERSION = 3.9
VENV = venv
BIKESPACE_API_FLY_TOML = $(BIKESPACE_API_DIR)/fly.toml

export APP_SETTINGS = bikespace_api.config.DevelopmentConfig
export DATABASE_URL = postgresql://postgres:postgres@localhost:5432/bikespace_dev
export FLASK_DEBUG = true

setup-py: $(VENV)

clean:
	rm -rf $(VENV)
	rm -rf $(SWAGGER_UI)

$(VENV): $(BIKESPACE_API_DIR)/requirements.txt
	python$(PYTHON_VERSION) -m venv $(VENV)
	. $(VENV)/bin/activate
	$(PIP) install -r $(BIKESPACE_API_DIR)/requirements.txt
	touch $(VENV)

pip-freeze: $(BIKESPACE_API_DIR)/requirements.txt
	$(PIP) freeze > $(BIKESPACE_API_DIR)/requirements.txt

run-flask-app: setup-py
	$(PYTHON) $(MANAGE_PY) run

lint-py:
	$(PYTHON) -m black $(BIKESPACE_API_DIR)

seed-db: setup-py
	$(PYTHON) $(MANAGE_PY) seed-db

recreate-db: setup-py
	$(PYTHON) $(MANAGE_PY) recreate-db

fly-deploy-api: $(BIKESPACE_API_FLY_TOML)
	cd $(BIKESPACE_API_DIR) && flyctl deploy

.PHONY: setup-py clean pip-freeze run-flask-app lint-py seed-db recreate-db fly-deploy-api