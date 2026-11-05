#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    --set=java_password="$SUBASTAYA_JAVA_PASSWORD" \
    --set=dotnet_password="$SUBASTAYA_DOTNET_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE subastaya_java LOGIN PASSWORD %L', :'java_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'subastaya_java')\gexec

SELECT format('CREATE ROLE subastaya_dotnet LOGIN PASSWORD %L', :'dotnet_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'subastaya_dotnet')\gexec

GRANT CONNECT ON DATABASE subastaya_db TO subastaya_java, subastaya_dotnet;
GRANT USAGE, CREATE ON SCHEMA public TO subastaya_java;
GRANT USAGE ON SCHEMA public TO subastaya_dotnet;
ALTER DEFAULT PRIVILEGES FOR ROLE subastaya_java IN SCHEMA public
    GRANT SELECT ON TABLES TO subastaya_dotnet;
SQL
