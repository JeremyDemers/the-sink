#!/usr/bin/env bash

set -e

# This config is necessary for running `git remote get-url`
# in the container that is launched on the host systems that
# runs Docker natively (Linux). The mentioned command is
# used by the `npm run docs:build`.
git config --global --add safe.directory "$DIR_MOUNT"

# Install dependencies.
npm install
# Start the app.
npm start
