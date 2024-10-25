ARG FROM
FROM $FROM

COPY app/ app/
COPY aws/services/cli-tools/* /usr/bin/
COPY aws/services/supervisor/event-listeners/cleanup-uploads.py /usr/local/bin/cleanup-uploads.py
COPY aws/services/supervisor/conf/ /etc/supervisord.d/

USER smartlabuser
# Provided by the platform.
# See https://github.com/JeremyDemers/the-sink/blob/main/runtimes/python/services/cli-tools/app-init
RUN app-init

USER root
# Provided by the platform.
# See https://github.com/JeremyDemers/the-sink/blob/main/runtimes/python/services/cli-tools/container-init
CMD ["container-init"]
