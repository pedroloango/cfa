-- Migration: Add 'Patrocínio' to payment_types table
insert into payment_types (name) values
  ('Patrocínio')
on conflict do nothing; 