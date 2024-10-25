# Configure local environment

## Prerequisites

The host machine should have installed the following:

* Docker.

Open the shell terminal and `cd` to the project's folder.

## Initialisation

Before starting the apps, please configure local .env file with required credentials. To do so:

* Create `.env` file in the project root out of the `.env.example`.
  ```bash
  cp .env.example .env
  ```
* Configure SSO by getting the `Client ID` and `Client Secret` from the corresponding app client and set them in the `.env` file.
  ```dotenv
  AWS_COGNITO_USER_POOL_CLIENT_ID="..."
  AWS_COGNITO_USER_POOL_CLIENT_SECRET="..."
  ```

The PostgreSQL database, Flask, React, pgAdmin apps will be run in a Docker container. Configuration is defined in [docker-compose.yml](/docker-compose.yml).

## Start the containers

To start the containers navigate to the repository root and execute:

```shell
slw up -d
```

Important: it will take few minutes for the components to be available (on the start of the containers we run initialisation scripts - installing npm dependencies, building React app, installing Flask dependencies, etc.).

- The database will be available at `postgresql://postgres:postgres@postgres:5432/postgres` from inside Docker network. Additionally, on the stack start, the database is exposed to the host on a random port. Check it by running `docker ps`. The connection string from the host then would be `postgresql://127.0.0.1:postgres@postgres:[RANDOM_PORT]/postgres`.
- The `pgAdmin` interface will be available at http://localhost:8000/pgadmin/
- The `React` frontend will be available at http://localhost:8000/
- The `Flask` app will be available at http://localhost:8000/api/

## Executing commands in the containers

You can open an interactive shell session to any of the services.

```
slw bash SERVICE_NAME
```

The `SERVICE_NAME` can be: `postgres`, `client`, `server`.

For example, if you want to re-install NPM dependencies for the client (React) you can do following:

```shell
# You will get inside the client (React) container
slw bash client

# Any command you need yo run
npm i 
```

### Stop the containers

To stop the services run:

```shell
slw stop
```

P.S. we use default `localhost` domain due to AWS Cognito restriction of HTTP being allowed only for this tld.

## Python virtual environment

Sometimes you would want to install project dependencies on the host machine, for instance you need them for local development, or to enable IDE type hinting. By default, host machine doesn't have access to them, as they are installed inside docker container. Follow instructions, bellow to install them with [venv](https://docs.python.org/3/library/venv.html).

* Navigate to the project folder:
  ```shell
  cd app/server
  ```

* Initialize `venv` run:
  ```shell
  make venv
  ```

### Start

* Activate `venv`:
  ```shell
  source venv/bin/activate
  ```

* Install dependencies (see [Makefile](/app/server/Makefile)):
  ```shell
  make install
  ```

Follow next steps to configure your IDE:
- [PyCharm](https://www.jetbrains.com/help/pycharm/creating-virtual-environment.html#env-requirements)
- [VS Code](https://code.visualstudio.com/docs/python/environments)

## How to Debug

### VS Code

Supported IDE - VS Code

Flask app is being started through `debugpy` by default and codebase has a pre-build configuration for `VS Code` for Python debugging.

### PyCharm

1. Create a new `Python Debug Server` configuration:
    * Go to `Run -> Edit Configurations`, click on the `+` button and select `Python Debug Server`.
    * In the `Host` field, enter `localhost`. In the `Port` field, enter `5678` (the same port you're using in your Docker container).
2. Start the `Python Debug Server` in PyCharm.
3. Change `DEBUGGER` environment variable in the [docker-compose.yml](/docker-compose.yml) file to `pycharm`.
4. As the first lines in the [__init__.py](/app/server/src/api/__init__.py) add:
    ```python
    import pydevd_pycharm
    pydevd_pycharm.settrace('host.docker.internal', port=5678, stdoutToServer=True, stderrToServer=True, suspend=False)
    ```
5. [Start the containers](#start-the-containers).

### Neovim / Vim - via DAP-Python

1. Download and enable following plugin https://github.com/mfussenegger/nvim-dap-python and all the dependencies;
2. Edit your `init.vim` - load DAP plugin:
   ```lua
   lua require('dap-python').setup('python')
   ```
3. Attach to DebugPy remote:
   ```lua
   ":lua require'dap'.continue()" -> enter
   "3" -> enter
   -> enter
   "5679" -> enter
   ```

Your DAP will be attached to the `DebugPY`. A path-mapping configuration may be required.
