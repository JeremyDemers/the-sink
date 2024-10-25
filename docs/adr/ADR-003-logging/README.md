# ADR-003: Logging

## Context

Actions performed by the users of the application must be logged. This is necessary for auditing, debugging, and monitoring.

## Decision

To avoid additional complexity, we will use the logging solution provided by AWS. As application logs by default are streamed the CloudWatch, we will use it as a logging solution.

Actions that have to be logged include:

* User login/logout
* User edit
* Project add/edit
* Project transition in the workflow

CloudWatch logs will be stored in the log group `/ecs/smart-lab-web/${AppName}-${AppEnv}-app`, where `${AppName}` is the name of the application (e.g., `smart-lab-web-base`, `smart-lab-web-uv-report`, etc.) and `${AppEnv}` is the environment (e.g., `stage`, `uat`, `prod`). The log group will be created automatically by the application and will retain logs for 1 month.

## Status

- [x] Proposed on 2024-05-30
- [x] Approved on 2024-05-30

## Consequences

* The application will have a default built-in logging solution.
* If application adds more actions that need to be logged, the developers of the application are responsible to log these actions.
* The logs will be stored in CloudWatch and thus only be available in the AWS console. To access them, the user will need to have the appropriate permissions.
* The logs will be retained for 1 month. After that, they will be automatically deleted.
