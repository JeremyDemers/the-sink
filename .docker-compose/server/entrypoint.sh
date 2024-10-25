#!/usr/bin/env bash

set -e

# Install dependencies.
make install
# Start the app.
# shellcheck disable=SC1091
source /opt/cli-tools/app-boot

if [[ "$DEBUGGER" = "vscode" ]]; then
    # Run Flask with VSCode debugger.
    python -m debugpy --listen 0.0.0.0:5679 --wait-for-client -m \
        flask --debug run -h 0.0.0.0 -p "$PORT_FLASK"
else
    # Run Flask without debugger, or with PyCharm debugger.
    flask --debug run -h 0.0.0.0 -p "$PORT_FLASK"
fi
