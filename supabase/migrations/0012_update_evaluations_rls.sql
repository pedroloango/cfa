-- Drop existing policies
drop policy if exists "Users can insert their own evaluations" on evaluations;
drop policy if exists "Users can view all evaluations" on evaluations;
drop policy if exists "Users can update their own evaluations" on evaluations;
drop policy if exists "Users can delete their own evaluations" on evaluations;

-- Create new policies that work with our custom authentication
create policy "Enable insert for authenticated users"
  on evaluations for insert
  with check (true);

create policy "Enable select for authenticated users"
  on evaluations for select
  using (true);

create policy "Enable update for authenticated users"
  on evaluations for update
  using (true);

create policy "Enable delete for authenticated users"
  on evaluations for delete
  using (true); 