# Application configuration.

The project configuration [module](/app/server/src/api/config/__init__.py) provides environment-specific settings for the application, allowing it to adapt to different deployment environments such as development, staging, UAT, and production. It uses environment variables for configuration and leverages the dotenv package to load these variables from a .env file.

## Environment variables

They are read from the `.env` file in the project root. You can use already preconfigured `.env.example` by just renaming it.

There are only two variables that **MUST** be configured to run the project, both of them should be requested from project administrator: `AWS_COGNITO_USER_POOL_CLIENT_ID`, `AWS_COGNITO_USER_POOL_CLIENT_SECRET`. Whenever these keys changes you have to restart server container.

### Core Variables

- `SECRET_KEY` **[Preconfigured]**: Secret key used for encryption and ensuring the security of the application. It is used for signing sessions and other security operations. Default value: dev.

### Database Variables

- `DATABASE_ENGINE` **[Preconfigured]**: The database engine used.
- `DATABASE_HOST` **[Preconfigured]**: The host where the database is located.
- `DATABASE_PORT` **[Preconfigured]**: The port to connect to the database.
- `DATABASE_NAME` **[Preconfigured]**: The name of the database.
- `DATABASE_USER` **[Preconfigured]**: The database user.
- `DATABASE_PASSWORD` **[Preconfigured]**: The password to connect to the database.

### AWS Variables

- `AWS_REGION` **[Preconfigured]**: The AWS region where the resources are located. For example, `us-east-1`.
- `AWS_COGNITO_USER_POOL_ID` [**Preconfigured**]: The AWS Cognito user pool ID.
- `AWS_COGNITO_DOMAIN` [**Preconfigured**]: The AWS Cognito domain.
- `AWS_COGNITO_USER_POOL_CLIENT_ID` [**Must be configured**]: The client ID of the AWS Cognito user pool.
- `AWS_COGNITO_USER_POOL_CLIENT_SECRET` [**Must be configured**]: The client secret of the AWS Cognito user pool.
- `AWS_COGNITO_COOKIE_AGE_SECONDS` [**Preconfigured**]: The lifespan of the AWS Cognito cookie in seconds. Default value is aligned with cognito configuration: `3600`.

### Administrative Users

`ADMIN_USERS`: A comma-separated list of admin users' email addresses (case-insensitive). 

Users will be created automatically upon:
- dev, stage, uat, prod: application deployment.
- local: whenever the `server` container starts or restarts.

## App specific configuration

Configuration [module](/app/server/src/api/config/__init__.py) populates corresponding app config keys with environment variables. However, there are configuration keys that can are not environment specific, and should be configured in the module config:

- `AWS_COGNITO_OPEN_REGISTRATION` **[Default: Open]**: whether any user that has valid sink credentials can log into the APP or user account should be created first.
- `AWS_COGNITO_DISABLED` **[Default: False]**: Disables the SSO access token verification. Allows manually visiting  `/api/auth/cognito/fake` in the browser to sign in under a generic user (a developer can be off VPN which allows developing an app offline). Takes effect only during the development and ignored on AWS.
- `ALLOWED_EXTENSIONS` **[Default: PDF]**: File extensions list that are allowed to be uploaded into the App.  
- `MAX_CONTENT_LENGTH` **[Default: 32MB]**: Max file size that is allowed to be uploaded.

### How to add new env variables.

To add new environment variable:

- DEV/STAGE/UAT/PROD: you should have access to the AWS secret manager `$APP_NAME-$APP_ENV-secret-core` key and new value there.
- Local: you should add this variable into `.env.example` and `.env` file.

However, there is an exception to this rule: if you need to add File, for instance security key, that shouldn't be a part of the repository:

- you have to create new AWS Secret manager key, with a naming `$APP_NAME-$APP_ENV-secret-{YOUR_NAME}`, try to come up with a shor name;
- you have to modify [buildspec.yaml](/aws/buildspec.yaml) to extract that key and assign it contents to the specific env variable or create physical file on the disk.
