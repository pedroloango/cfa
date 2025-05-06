-- Migration: Create payment_types table and add payment_type_id to payments
create table if not exists payment_types (
  id bigserial primary key,
  name text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insert default payment types
insert into payment_types (name) values
  ('Mensalidade'),
  ('Aluguel de quadra'),
  ('Uniforme'),
  ('Taxa de inscrição'),
  ('Outros')
on conflict do nothing;

-- Add foreign key to payments table
alter table payments
  add column payment_type_id bigint not null default 1 references payment_types(id); 