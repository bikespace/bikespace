PYTHON_VERSION = 3.9
VENV = venv
PYTHON  = $(VENV)/bin/python3
PIP = $(VENV)/bin/pip
BIKESPACE_BACKEND_DIR = bikespace_backend
MANAGE_PY = $(BIKESPACE_BACKEND_DIR)/manage.py
export FLASK_DEBUG = true
export APP_SETTINGS = bikespace_backend.config.DevelopmentConfig
export DATABASE_URL = postgresql://postgres:postgres@localhost:5432/bikespace_dev


setup-py: $(VENV)

clean:
	rm -rf $(VENV)

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

.PHONY: setup-py clean pip-freeze run-flask-app lint-py