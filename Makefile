BIKESPACE_BACKEND_DIR = bikespace_backend
MANAGE_PY = $(BIKESPACE_BACKEND_DIR)/manage.py
PIP = $(VENV)/bin/pip
PYTHON  = $(VENV)/bin/python3
PYTHON_VERSION = 3.9
VENV = venv

export APP_SETTINGS = bikespace_backend.config.DevelopmentConfig
export DATABASE_URL = postgresql://postgres:postgres@localhost:5432/bikespace_dev
export FLASK_DEBUG = true

$(PYTHON): setup-py
$(PIP): setup-py

setup-py: $(VENV)

clean:
	rm -rf $(VENV)
	rm -rf $(SWAGGER_UI)

$(VENV): requirements.txt
	python$(PYTHON_VERSION) -m venv $(VENV)
	. $(VENV)/bin/activate
	$(PIP) install -r requirements.txt
	touch $(VENV)

pip-freeze: requirements.txt
	$(PIP) freeze > requirements.txt

run-flask-app: setup-py
	$(PYTHON) $(MANAGE_PY) run

lint-py:
	$(PYTHON) -m black $(BIKESPACE_BACKEND_DIR)

seed-db: setup-py
	$(PYTHON) $(MANAGE_PY) seed-db

recreate-db: setup-py
	$(PYTHON) $(MANAGE_PY) recreate-db

.PHONY: setup-py clean pip-freeze run-flask-app lint-py seed-db recreate-db