-- Migration: Create receitas table
create table if not exists receitas (
  id bigserial primary key,
  description text not null,
  payment_type_id bigint not null references payment_types(id),
  value numeric not null,
  revenue_date date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
); 