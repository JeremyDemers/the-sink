ARG VERSION
FROM python:${VERSION}-slim

ARG VERSION
ARG WORKDIR

RUN set -xe; \
    apt-get update >/dev/null; \
    apt-get -y --no-install-recommends install >/dev/null \
        libmagic-dev \
        make \
        poppler-utils \
    ; \
    pip install debugpy; \
    pip install pydevd-pycharm; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

ENV \
    # By default, Python store bins inside `/usr/local/bin` while the goal
    # here is to preserve the insllated packages between the stack restarts.
    PATH="$WORKDIR/python/bin:$PATH" \
    # The `pip install` stores inside this directory. `venv` behaves similarly.
    PIP_PREFIX="$WORKDIR/python" \
    # Tell Python where to look for packages.
    PYTHONPATH="$WORKDIR/python/lib/python$VERSION/site-packages:$WORKDIR/src"

COPY entrypoint.sh /opt
WORKDIR "$WORKDIR"
ENTRYPOINT ["/opt/entrypoint.sh"]
