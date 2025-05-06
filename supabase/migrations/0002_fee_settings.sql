-- Table for fee_settings
create table if not exists fee_settings (
  id bigserial primary key,
  category text not null unique,
  value numeric not null
); 