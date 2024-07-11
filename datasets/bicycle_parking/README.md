# bicycle_parking

This is a [Dagster](https://dagster.io/) project scaffolded with [`dagster project scaffold`](https://docs.dagster.io/getting-started/create-new-project).

### Make Commands

TODO - should replace instructions below

### Getting started

First, install your Dagster code location as a Python package. By using the --editable flag, pip will install your Python package in ["editable mode"](https://pip.pypa.io/en/latest/topics/local-project-installs/#editable-installs) so that as you develop, local code changes will automatically apply.

```bash
pip install -e ".[dev]"
```

Then, start the Dagster UI web server:

```bash
dagster dev
```

Open http://localhost:3000 with your browser to see the project.

You can start writing assets in `bicycle_parking/assets.py`. The assets are automatically loaded into the Dagster code location as you define them.

### Development

#### Adding new Python dependencies

You can specify new Python dependencies in `setup.py`.

#### Unit testing

Tests are in the `bicycle_parking_tests` directory and you can run tests using `pytest`:

```bash
pytest bicycle_parking_tests
```


## OpenStreetMap Data Fields

### Important Fields

[**bicycle_parking**](https://wiki.openstreetmap.org/wiki/Key:bicycle_parking): indicates which type of bicycle parking a feature is. Common values:

- bollard: ring and post
- stands: can lean your bicycle against, e.g. a hoop
- rack: a bike rack where you can lock your wheel and frame
- wall_loops: "Wheelbender" racks where you can only lock your wheel
- lockers, shed, building: secure bicycle parking

Less common: 'two-tier', 'safe_loops', 'ground_slots', 'anchors', 'handlebar_holder', 'crossbar', 'lean_and_stick'

Use with caution: 'post_hoop', 'wide_stands'

Incorrect: 'wave',  'hoops'

### Other Fields

[**area**](https://wiki.openstreetmap.org/wiki/Area): indicates that the original geometry is a filled polygon




