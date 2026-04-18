FROM postgres:16-alpine

ENV POSTGRES_DB=aero_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

COPY init_schema_postgresql.sql /docker-entrypoint-initdb.d/

# Health check for PostgreSQL
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD pg_isready -U postgres || exit 1

EXPOSE 5432
