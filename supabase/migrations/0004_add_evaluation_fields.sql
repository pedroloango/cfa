-- Add technical, tactical, physical, and mental fields to evaluations
alter table evaluations
  add column if not exists technical integer not null default 0,
  add column if not exists tactical integer not null default 0,
  add column if not exists physical integer not null default 0,
  add column if not exists mental integer not null default 0; 