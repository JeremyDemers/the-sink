# React application

React application is written in TypeScript, it serves as the frontend for a
[Flask application](/app/server/README.md). The application is provisioned as a **client** service within a
Docker environment, specified in the docker-compose.yml file, using [init-client.sh](/.docker-compose/scripts/init-client.sh) entry point.

## Directory structure
- **public** - Contains static assets and the index.html file that serves as the entry point for the web application.
- **src** - Main source folder
  - *components*: Reusable UI components.
  - *context*: Contains React context files for managing global state across the application using the Context API.
  - *f-icons*: Directory for custom font icons used though the styles throughout the application.
  - *hooks*: Custom React hooks for encapsulating reusable logic.
  - *images*: Stores image files used in the application.
  - *lang*: Contains localization files for supporting multiple languages in the application.
  - *pages*: Includes components that represent full pages or views in the application, such as Login, Error, Basem and FormPageWrapper.
  - *plugins*: Holds plugin-related files or third-party integrations, currently custom i18n and Yup plugin.
  - *scss*: Contains SCSS stylesheets that are used across multiple components.
  - *state*: Manages application state, including Redux slices, actions, and reducers if Redux is being used.
  - *tests*: Unit tests files for testing the application.
  - *utils*: Utility functions and helpers used throughout the application.
  - *App.scss*: Global SCSS file for the tyling an `App` component.
  - *App.tsx*: The main App component which acts as the root component for the application.
  - *setupTests.ts*: Global configuration file for setting up Jest.
- **[.eslintrc.json](.eslintrc.json)** - ESLint configuration file.
- **[.gitignore](.gitignore)** - List of files that would be ignored by Git.
- **[craco.config.js](craco.config.js)** - CRACO configuration file.
- **[package.json](package.json)** - Installed packages.
- **[tsconfig.json](tsconfig.json)** - TypeScript configuration.

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and [CRACO](https://craco.js.org/docs/).
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
You can learn more about [JEST test framework](https://jestjs.io/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
