CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_updated_at
ON users(updated_at);

CREATE TABLE IF NOT EXISTS watermarks (
    id SERIAL PRIMARY KEY,
    consumer_id VARCHAR(255) NOT NULL UNIQUE,
    last_exported_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN

        INSERT INTO users (name, email, created_at, updated_at, is_deleted)
        SELECT
            'User ' || gs AS name,
            'user' || gs || '@example.com' AS email,
            NOW() - (RANDOM() * INTERVAL '30 days') AS created_at,
            NOW() - (RANDOM() * INTERVAL '7 days') AS updated_at,
            (RANDOM() < 0.01) AS is_deleted
        FROM generate_series(1, 100000) AS gs;

    END IF;
END $$;
