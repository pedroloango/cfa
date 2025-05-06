-- Add created_by column to evaluations table
alter table evaluations
  add column if not exists created_by uuid references users(id);

-- Add RLS policies for evaluations
alter table evaluations enable row level security;

-- Policy for inserting evaluations
create policy "Users can insert their own evaluations"
  on evaluations for insert
  with check (auth.uid() = created_by);

-- Policy for viewing evaluations
create policy "Users can view all evaluations"
  on evaluations for select
  using (true);

-- Policy for updating evaluations
create policy "Users can update their own evaluations"
  on evaluations for update
  using (auth.uid() = created_by);

-- Policy for deleting evaluations
create policy "Users can delete their own evaluations"
  on evaluations for delete
  using (auth.uid() = created_by); 