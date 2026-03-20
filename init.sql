-- init.sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'storage_db') THEN
    CREATE DATABASE storage_db;
  END IF;
END
$$;
GRANT ALL PRIVILEGES ON DATABASE storage_db TO storage_user;