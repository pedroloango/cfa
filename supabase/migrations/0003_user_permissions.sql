-- Add permissions column to users
alter table users
  add column if not exists permissions text[] default '{}'; 