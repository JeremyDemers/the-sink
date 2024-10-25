ARG VERSION
FROM node:${VERSION}-slim

ARG WORKDIR

RUN set -xe; \
    apt-get update >/dev/null; \
    apt-get -y --no-install-recommends install >/dev/null \
        git \
    ; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

ENV \
    # Allow running `git` commands in repo's child directories.
    GIT_DISCOVERY_ACROSS_FILESYSTEM=1

COPY entrypoint.sh /opt
WORKDIR "$WORKDIR"
ENTRYPOINT ["/opt/entrypoint.sh"]
