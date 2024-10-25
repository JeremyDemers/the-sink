# SmartLab Web CLI

The SLW CLI extends the Docker Compose to enhance a developer's experience and simplify the day-to-day routines working with SmartLab Web projects.

> [!CAUTION]
> The `docker compose` (or `docker-comopse`) CLIs won't work inside the SLW projects! Please use `slw` as a replacement. I.e. `slw up -d`, `slw start`, `slw stop`, `slw down`, `slw logs`, etc.

## Why?

- To maintain the host's files ownership by automatically determining the parameters of a current user on a host (name, ID, and the group ID) and passing them to the [docker-compose.yml](/docker-compose.yml) for replicating the same user inside the app's containers.

- To allow running multiple applications at the same time by automatically finding a free port on `127.0.0.1` (the lookup starts from `8000`).

- To centralize custom commands in one place so a change doesn't become a burden of rolling it out to all existing projects.

## Installation

1. Clone the repository. Feel free to change the destination (defaults to the home directory).

   ```bash
   cd ~/
   git clone git@github.com:JeremyDemers/slw-cli.git
   ```

2. Make a symlink so the `slw` is globally available.

   ```bash
   sudo ln -s ~/slw-cli/slw /usr/local/bin/slw
   ```

## Usage

Print the list of available commands and their help.

```bash
# Or `slw --help` or `slw help`.
slw -h
```

### bash

A shortcut for the `docker compose exec server bash --login`.

```bash
slw bash
```

> [!TIP]
> Pass the service name as an argument to log into another container.
> ```bash
> slw bash client
> ```

### compose

An extension of the `docker compose` that computes necessary variables used in the [docker-compose.yml](/docker-compose.yml).

```bash
# Or `slw compose`.
slw
```

> [!NOTE]
> When the first argument to the `slw` is not a name of one of the custom commands the `compose` command is assumed by default.

### dbi

The container with the database is exposed to the localhost on a dynamically computed port on the project startup.

Run `slw dbi` to print out the database connection details (i.e. to use them in a favorite GUI tool).

> [!NOTE]
> `dbi` stands for `Database Information`.

```bash
jdemers@:~/the-sink $ slw dbi
Host:      127.0.0.1
Port:      63035
Database:  postgres
User:      postgres
Password:  postgres
```

> [!NOTE]
> The port changes on the project restart thus the connection details update in the GUI tool is necessary.

### ecs-login

Start a shell session in the app's AWS ECS container. The command is interactive and asks to provide the following information:
- the Identity Provider out of the configured ones;
- the AWS region (preselects configured for the Identity Provider but allows to input the other one);
- the application environment (e.g. `stage`, `uat`, `prod`).

#### Requirements

- The AWS account with the right IAM role that allows accessing the app's resources.
- `aws-cli`, see https://github.com/aws/aws-cli

```bash
slw ecs-login
```

#### Snippets

This section contains helpful command snippets to run inside the AWS ECS container or any other CLI.

##### SQL Query

```bash
$ flask --app api shell
Python 3.12.4 (main, Jul  2 2024, 20:57:30) [GCC 12.2.0] on linux
App: api
Instance: /var/www/app/server/src/instance
>>> from api.database import db
>>> from sqlalchemy import text
>>> db.session.execute(text("select * from alembic_version")).fetchall()
[('511c8298fa07',)]
```

> [!NOTE]
> Normally, the CLI wouldn't have the SQL-specific software available hence even having the connection details at hand there is no way to utilize them (the DB is unavailable outside the VPC).

### flog

A shortcut for the `docker compose logs --follow --tail 100 server`.

```bash
slw flog
```

> [!NOTE]
> `flog` stands for `Follow the Logs`.

> [!TIP] 
> Pass the service name as an argument to follow the logs of another container.
> ```bash
> slw flog client
> ```

### si

Prints out all outputs of the app's Cloudformation Stack. The command is interactive and asks to provide the following information:
- the Identity Provider out of the configured ones;
- the AWS region (preselects configured for the Identity Provider but allows to input the other one);
- the application environment (e.g. `stage`, `uat`, `prod`).

> [!NOTE]
> `si` stands for `Stack Information`.

#### Requirements

- The AWS account with the right IAM role that allows accessing the app's resources.
- `aws-cli`, see https://github.com/aws/aws-cli

```bash
slw si
```

Output example:

```text
Use "pf" identity provider? (Y/n)
Use "us-east-1" AWS Region? (Y/n)
Use "stage" Environment? (Y/n)
EcsAlbDNSName: internal-slw-base-stage-1917286908.us-east-1.elb.amazonaws.com
```

### rds-dump

Create a database snapshot of the AWS app and place it on S3. The command is interactive and asks to provide the following information:
- the Identity Provider out of the configured ones;
- the AWS region (preselects configured for the Identity Provider but allows to input the other one);
- the application environment (e.g. `stage`, `uat`, `prod`).

#### Requirements

- The AWS account with the right IAM role that allows accessing the app's resources.
- `aws-cli`, see https://github.com/aws/aws-cli

```bash
slw rds-dump
```

> [!NOTE]
> Under the hood the command runs [aws/services/cli-tools/rds-dump](/aws/services/cli-tools/rds-dump) script to make a snapshot and place it on S3.

Output example:

```text
Use "pf" identity provider? (Y/n)
Use "us-east-1" AWS Region? (Y/n)
Use "stage" Environment? (Y/n)
AWS Cluster: smart-lab-web-base-stage-ecs-cluster
ECS Service ARN: arn:aws:ecs:us-east-1:791707043329:service/smart-lab-web-base-stage-ecs-cluster/smart-lab-web-base-stage-ecs-service
ECS Task ARN: arn:aws:ecs:us-east-1:791707043329:task/smart-lab-web-base-stage-ecs-cluster/e6bcc050854443d8b57f3d3a4ba9f674

The Session Manager plugin was installed successfully. Use the AWS CLI to start a session.


Starting session with SessionId: ecs-execute-command-rvqat7d75gdriaoeseox58p6ui
==> [INFO] The DB snapshot has been uploaded to "https://us-east-1.console.aws.amazon.com/s3/buckets/791707043329-smart-lab-web-platform-pipeline?bucketType=general&prefix=smart-lab-web-base/rds/snapshots/"


Exiting session with sessionId: ecs-execute-command-rvqat7d75gdriaoeseox58p6ui.
```

> [!NOTE]
> Please consider deleting the snapshot after downloading it.

### update

Updates the SLW CLI by running a `git pull` inside its installation directory.

```bash
slw update
```

## Add a new command

1. Create `test.sh` inside `/path/to/slw-cli/commands`
2. Add the following contents to the file:
   ```bash
   #!/usr/bin/env bash

   ## [help]
   ## This is the help message of this command.
   ## [/help]
   ##
   ## Usage:
   ##   slw test

   set -e

   echo "Hello from the \"$COMMAND_NAME\" command of the \"$APP_NAME\" app."
   ```
3. Tune the name, help message, and the logic as needed.

> [!NOTE]
> Please note that the `$APP_NAME`, `$COMMAND_NAME`, `$COMPOSE_PROJECT_NAME`, `$COMPOSE_PROJECT_NAME_SAFE`, `$DOTENV_PATH`, `$PROJECT_DIR`, and variables from [.env](/.env.example) with all functions from [functions.sh](https://github.com/JeremyDemers/slw-cli/blob/main/utils/functions.sh) are automatically available inside every command.
>
> - The `$APP_NAME` is read from the `AppName` property in [aws/cfn-template-configuration-prod.json](/aws/cfn-template-configuration-prod.json).
> - The `$COMMAND_NAME` is the unique command ID, e.g. `dbi`, `ecs-login`.
> - The `$COMPOSE_PROJECT_NAME` is the name of a directory with the project.
> - The `$COMPOSE_PROJECT_NAME_SAFE` is a transformed variant of `$COMPOSE_PROJECT_NAME` where only dashes, underscores, digits, and lowercase letters were left.
