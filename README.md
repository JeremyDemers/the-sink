# The Sink

Project development documentation can be found [here](https://github.com/JeremyDemers/the-sink/tree/1.1/docs/app/web).

The application consists of 3 main parts:
1. PostgreSQL - storage for registered users.
2. Flask backend - handles all calculations and Rest API calls.
3. React frontend - the UI.

## Prerequisites

- Install Docker.
- Install [SLW CLI](https://github.com/JeremyDemers/the-sink/tree/1.1/docs/app/web/devops/slw-cli).

## Installation

```bash
# Clone the repository.
git clone git@github.com:JeremyDemers/YOUR_PROJECT.git

# Navigate to the project directory.
cd YOUR_PROJECT

# Spin up the Docker Compose stack.
slw up -d
```

## Directories structure

- [.github](.github): GitHub Actions workflows for continuous integration and deployment.
  - [workflows/ci.yml](.github/workflows/ci.yml): The Continuous Integration workflow.
  - [workflows/deploy.yml](.github/workflows/deploy.yml): The workflow for a manual deployment.
- [app](app): contains React and Flask applications.
  - [app/client](app/client): React application.
  - [app/server](app/server): Flask application.
- [aws](aws): The AWS-specific configurations and scripts, such as build specification, CloudFormation templates and production application image.
- [.docker-compose](.docker-compose): Contains configurations for Docker Compose services used for local development.
