BIKESPACE_BACKEND_DIR = bikespace_backend
MANAGE_PY = $(BIKESPACE_BACKEND_DIR)/manage.py
PIP = $(VENV)/bin/pip
PYTHON  = $(VENV)/bin/python3
PYTHON_VERSION = 3.9
SWAGGER_UI = swagger-ui
SWAGGER_UI_DIST = $(SWAGGER_UI)/$(SWAGGER_UI)-$(SWAGGER_UI_VERSION)/dist
SWAGGER_UI_RELEASE_URL = "https://github.com/swagger-api/swagger-ui/archive/refs/tags"
SWAGGER_UI_TAR = swagger-ui-4.17.0.tar.gz
SWAGGER_UI_VERSION = 4.17.0
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

$(SWAGGER_UI):
	wget -P $(SWAGGER_UI) $(SWAGGER_UI_RELEASE_URL)/v$(SWAGGER_UI_VERSION).tar.gz
	tar -xzf $(SWAGGER_UI)/v$(SWAGGER_UI_VERSION).tar.gz -C $(SWAGGER_UI)/
	touch $(SWAGGER_UI)

run-swagger-ui: $(SWAGGER_UI) $(PYTHON)
	$(PYTHON) -m http.server -d $(SWAGGER_UI_DIST) 

.PHONY: setup-py clean pip-freeze run-flask-app lint-py get-swagger-ui run-swagger-ui