-- Migration: Add description to payments table
alter table payments
  add column description text; 