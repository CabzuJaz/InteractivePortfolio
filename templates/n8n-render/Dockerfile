FROM n8nio/n8n:latest

ENV N8N_PORT=5678
ENV N8N_PROTOCOL=https
ENV N8N_SECURE_COOKIE=false

# External Postgres (set in Render dashboard, not here)
# Required for persistent storage on free tier (ephemeral filesystem)
# DB_TYPE=postgresdb
# DB_POSTGRESDB_HOST=
# DB_POSTGRESDB_PORT=5432
# DB_POSTGRESDB_DATABASE=
# DB_POSTGRESDB_USER=
# DB_POSTGRESDB_PASSWORD=
# DB_POSTGRESDB_SSL_ENABLED=true

# Encryption key (generate with: openssl rand -hex 32)
# N8N_ENCRYPTION_KEY=

EXPOSE 5678
