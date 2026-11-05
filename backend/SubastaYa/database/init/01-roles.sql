DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'subastaya_java') THEN
        CREATE ROLE subastaya_java LOGIN PASSWORD 'REDACTED_JAVA_PASSWORD';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'subastaya_dotnet') THEN
        CREATE ROLE subastaya_dotnet LOGIN PASSWORD 'REDACTED_DOTNET_PASSWORD';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE subastaya_db TO subastaya_java, subastaya_dotnet;
GRANT USAGE, CREATE ON SCHEMA public TO subastaya_java;
GRANT USAGE ON SCHEMA public TO subastaya_dotnet;
ALTER DEFAULT PRIVILEGES FOR ROLE subastaya_java IN SCHEMA public
    GRANT SELECT ON TABLES TO subastaya_dotnet;
