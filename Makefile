PYTHON_VERSION = 3.9
VENV = venv
PYTHON  = $(VENV)/bin/python3
PIP = $(VENV)/bin/pip
MANAGE_PY = bikespace_backend/manage.py

export FLASK_DEBUG := true

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

run-flask-app:
	$(PYTHON) $(MANAGE_PY) run

.PHONY: setup-py clean pip-freeze run-flask-app