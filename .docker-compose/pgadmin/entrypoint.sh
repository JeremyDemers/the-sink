#!/usr/bin/env sh

set -e

cat <<EOF > "$PGADMIN_SERVER_JSON_FILE"
{
  "Servers": {
    "1": {
      "Name": "$DATABASE_NAME",
      "Group": "Servers",
      "Host": "$DATABASE_HOST",
      "Port": $DATABASE_PORT,
      "MaintenanceDB": "$DATABASE_NAME",
      "Username": "$DATABASE_USER",
      "SSLMode": "prefer"
    }
  }
}
EOF

/entrypoint.sh
