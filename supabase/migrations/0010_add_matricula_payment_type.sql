-- Migration: Add 'Matrícula' to payment_types table
insert into payment_types (name) values
  ('Matrícula')
on conflict do nothing; 