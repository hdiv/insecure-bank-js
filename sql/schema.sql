create table account (
    username varchar(80) primary key not null,
    name varchar(80) not null,
    surname varchar(80) not null,
    password varchar(80) not null
);

create table cashaccount (
    id int primary key not null,
    number varchar(80) not null,
    username varchar(80)  not null,
    availablebalance double precision,
    description varchar(80)  not null
);

create table creditaccount(
    id int primary key not null,
    number varchar(80) not null,
    username varchar(80)  not null,
    description varchar(80)  not null,
    availablebalance double precision,
    cashaccountid int
);


create table transfer(
    id integer primary key AUTOINCREMENT,
    fromAccount varchar(80) not null,
    toAccount varchar(80)  not null,
    description varchar(80)  not null,
    amount double precision,
    fee double precision,
    username varchar(80)  not null,
    date TIMESTAMP
);

create table "transaction"(
    id integer primary key AUTOINCREMENT,
    date TIMESTAMP,
    description varchar(80)  not null,
    number varchar(80) not null,
    amount double precision,
    availablebalance double precision
);
