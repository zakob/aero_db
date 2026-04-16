FROM postgres:16-alpine

ENV POSTGRES_DB=aero_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

COPY init_schema_postgresql.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
