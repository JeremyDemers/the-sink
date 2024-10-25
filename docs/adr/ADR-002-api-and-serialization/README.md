# ADR-002: API resources and serialization

## Context

The application should provide a RESTful API to interact with the data. The API should support CRUD operations for the ORM models.

The application should support validation, serialization and deserialization of the ORM models to/from JSON format.

## Decision

Given the requirements, it was decided to use [Flask-RESTful](https://pypi.org/project/Flask-RESTful/) for the API implementation. It is a lightweight extension of Flask that adds support for quickly building REST APIs. Additional feature of it is that Flask routes are grouped by resources, which makes the code more organized and easier to maintain.

The [marshmallow](https://pypi.org/project/marshmallow/) package will be used for validation, serialization and deserialization. It is capable of validating and serializing complex data types, such as nested objects, and provides a simple and flexible API.

These packages are well-documented, follow industry standards, and are widely used, making them a reliable basis for the system.

## Status

- [x] Proposed on 2024-05-28
- [x] Approved on 2024-05-29

## Consequences

* Dependency on the `Flask-RESTful` and `marshmallow`.
