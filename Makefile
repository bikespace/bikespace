PYTHON_VERSION = 3.9
VENV = venv
PYTHON  = $(VENV)/bin/python3
PIP = $(VENV)/bin/pip

setup-py: $(VENV)

clean:
	rm -rf $(VENV)

$(VENV): requirements.txt
	python$(PYTHON_VERSION) -m venv $(VENV)
	. $(VENV)/bin/activate

pip-freeze: requirements.txt
	$(PIP) freeze > requirements.txt

.PHONY: setup-py clean pip-freeze