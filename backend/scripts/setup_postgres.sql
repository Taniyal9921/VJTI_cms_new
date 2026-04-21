-- Run as a superuser (e.g. postgres) in psql or pgAdmin:
--   psql -U postgres -h 127.0.0.1 -f scripts/setup_postgres.sql
--
-- Matches the default DATABASE_URL in app/core/config.py:
--   postgresql://postgres:cms_pass@127.0.0.1:5432/college_cms

CREATE USER postgres WITH PASSWORD 'cms_pass';
CREATE DATABASE vjti_cms OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE vjti_cms TO postgres;
