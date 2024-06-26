create database if not exists so1-proyecto1;
use so1-proyecto1;

create table cpu_info (
    id serial primary key,
    usage_percentage numeric(3,2),
    created_at timestamp default current_timestamp
);

create table memory_info (
    id serial primary key,
    usage_percentage numeric(3,2),
    created_at timestamp default current_timestamp
);