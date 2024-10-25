DIRS = ./src/ ./tests/

# Create Python virtual environment if not yet created.
# Run `. venv/bin/activate` to activate the environment.
venv:
	test -d venv || python3 -m venv venv

# Install requirements.
install:
	pip3 install -e .'[dev]'

# Reformat Python code with `autopep8` according to the style guide.
autopep:
	autopep8 $(DIRS)

# Reformat Python code with `black` according to the style guide.
black:
	black $(DIRS)

# Validate Python code with `black` according to the style guide.
black-check:
	black $(DIRS) --check --diff

# Validate Python code with `flake8` according to the style guide.
flake:
	flake8 $(DIRS)

# Validate Python code with `pylint` according to the style guide.
pylint:
	pylint $(DIRS)

# Check the static typing.
mypy:
	mypy $(DIRS)

test:
	coverage run -m pytest
	coverage report
	coverage html

# Run all linters.
lint:
	$(MAKE) --keep-going black-check flake pylint mypy

# Reformat Python code with all formatting tools.
reformat: autopep black
