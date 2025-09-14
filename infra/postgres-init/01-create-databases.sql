-- Create additional databases for local development
-- The default DB `app` is created by POSTGRES_DB

-- NOTE: init scripts only run on first container bootstrap (new data volume)
-- so a simple CREATE DATABASE is sufficient and idempotent across restarts.
CREATE DATABASE "customer-db";
