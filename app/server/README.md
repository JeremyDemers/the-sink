# Flask development server
Flask application has been provisioned as a server container in docker-compose.yml using [init-server.sh](/.docker-compose/scripts/init-server.sh) entry point.
The Flask application provides several API endpoints that are utilized by the [React application](/app/client/README.md).
These API endpoints are protected by TheSink Login(AWS Cognito) and Flask-Login, ensuring that
they are accessible only to authenticated users. This setup allows to leverage Python for heavy
mathematical operations and make secure calls to third-party services without exposing secret keys.

## Directory Structure
- .env.example: Example environment variables file.
- .pylintrc: Configuration file for [pylint](https://pypi.org/project/pylint/) tool
- mypy.ini:configuration file for [mypy](https://mypy-lang.org/) tool
- Makefile: File containing sets of commands for automating tasks.
- requirements.txt: File listing the project’s dependencies.
- requirements-dev.txt: File listing the development dependencies.
- server/: Main directory for the server-side application.
    - migrations/: Database migration scripts: creates user table.
    - src/api: Source files for the application.
        - auth/: Implementation of Flask login authentication.
        - blueprints/: Registration of Flask blueprints.
        - cache/: Caching mechanisms.
        - cognito/: Integration with Amazon Cognito.
        - config/: Configuration files.
        - database/: Database models and utilities.
        - models/: ORM models.
        - utils/: Utilities and helper functions.
        - init.py: initializes the Flask application, setting up **.env** based configuration,
        registering router blueprints, configure database, cache, and authentication services.
    - src/instance/: Directory for instance-specific configurations.
    - tests/: Tests for the application.
