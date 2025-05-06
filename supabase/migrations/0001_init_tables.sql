-- Enable uuid generation
create extension if not exists "pgcrypto";

-- Table for students
create table if not exists students (
  id bigserial primary key,
  name text not null,
  birth_date date,
  rg text,
  cpf text,
  category text not null,
  join_date date not null,
  polo text,
  status text not null,
  responsible_name text,
  responsible_cpf text,
  whatsapp text,
  address text,
  age integer,
  position text not null,
  phone text not null,
  has_scholarship boolean default false,
  scholarship_discount integer
);

-- Table for evaluations
create table if not exists evaluations (
  id bigserial primary key,
  student_id bigint references students(id) on delete cascade,
  date date not null,
  score integer,
  notes text
);

-- Table for monthly fees
create table if not exists monthly_fees (
  id bigserial primary key,
  student_id bigint references students(id) on delete cascade,
  month text not null,
  amount numeric not null,
  status text not null
);

-- Table for players (scout)
create table if not exists players (
  id bigserial primary key,
  name text not null,
  birth_date date,
  position text,
  team text,
  observations text
);

-- Table for matches (scout)
create table if not exists matches (
  id bigserial primary key,
  date timestamp not null,
  opponent text,
  location text,
  score text
);

-- Table for application users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text not null,
  created_at timestamp default now()
); 