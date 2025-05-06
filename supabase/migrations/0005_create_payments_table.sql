-- Table for payments (mensalidades)
create table if not exists payments (
  id bigserial primary key,
  student_id bigint references students(id) on delete cascade,
  category text not null,
  value numeric not null,
  due_date date not null,
  status text not null,
  payment_method text not null,
  month text not null,
  year text not null,
  payment_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
); 