# Code quality

This section contains information on how to run code linters and project tests. 

## Flask application

Pre-requirements, SSH to the `Flask` service container:

```shell
slw bash
```

Or install all required project dependencies on the host [machine](../local_setup#python-virtual-environment) and execute next commands from the host

### Code formatting

Automatic code formatting can be applied using the [autopep8](https://pypi.org/project/autopep8/) and [black](https://pypi.org/project/black/) by running the command below.

Consider running it before commit to keep the code style aligned (see [Makefile](/app/server/Makefile)).

```shell
make reformat
```

### Code lint

Lints are going to be run as a part of the CI process and include:

- `pylint`, see https://pypi.org/project/pylint/
- `flake`, see https://pypi.org/project/flake8/
- `mypy`, see https://pypi.org/project/mypy/

To run it locally use command (see [Makefile](/app/server/Makefile)):

```shell
make lint
```

### Automated testing

Automated tests are going to be run as a part of the CI process. To run them locally use (see [Makefile](/app/server/Makefile)):

```shell
make test
```

### Assertions & \_\_debug__

Please see [Python Assertions](py_assert) section to learn more about the Python optimization, how to disable it on AWS or enable locally.

## React application

Pre-requirements, SSH to the client service container:

```shell
slw bash client
```

### Code formatting

Applies automatic fixes for certain linting errors, such as formatting issues or minor code improvements, based on the rules defined in [.eslintrc.json](/app/client/.eslintrc.json) configuration.

```shell
npm run lint-fix
```

### Code lint

Lints are going to be run as a part of the CI process and can be executed locally.
Documentation for the ESLint can be found [here](https://eslint.org/docs/).

```shell
npm run lint
```

### Automated testing

Automated tests are going to be run as a part of the CI process. 

* ```shell
  npm test
  ```

  Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

* ```shell
  npm run test-coverage
  ```

  Launches the test runnier in the interactive watch mode, along with displaying all tests coverage information.

* ```shell
  npm test TEST_NAME
  ```

  Launches the tests runner in the interactive watch mode for the particular `TEST_NAME` test. For example, `npm test src/tests/Component.test.tsx`. Useful when you need to focus on a single feature.

* ```shell
  npm test TEST_NAME -- --coverage
  ```

  Runs the test along with displaying the current test coverage information.
