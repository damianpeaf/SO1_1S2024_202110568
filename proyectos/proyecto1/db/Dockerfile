FROM mysql:5.7

ENV MYSQL_ROOT_PASSWORD=root \
    MYSQL_DATABASE=so1-proyecto1 \
    MYSQL_USER=so1-proyecto1 \
    MYSQL_PASSWORD=so1-proyecto1

COPY ./ddl.sql /docker-entrypoint-initdb.d/

EXPOSE 3306