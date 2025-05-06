-- Function to generate payments for active students for a given year
create or replace function generate_payments_for_active_students(p_year integer)
returns void as $$
declare
  rec record;
  start_month integer;
  months text[] := array[
    'Janeiro','Fevereiro','Março','Abril',
    'Maio','Junho','Julho','Agosto',
    'Setembro','Outubro','Novembro','Dezembro'
  ];
begin
  for rec in (
    select id as student_id, category
    from students
    where status = 'Ativo'
  ) loop
    -- start generating from current month
    start_month := extract(month from current_date)::integer;
    for i in start_month..12 loop
      if not exists(
        select 1 from payments
        where student_id = rec.student_id
          and month = months[i]
          and year = p_year::text
      ) then
        insert into payments(
          student_id, category, value, due_date, status, payment_method, month, year, created_at, updated_at
        ) values (
          rec.student_id,
          rec.category,
          coalesce((select value from fee_settings where category = rec.category), 150),
          make_date(p_year, i, extract(day from current_date)::integer),
          'Pendente',
          'PIX',
          months[i],
          p_year::text,
          now(),
          now()
        );
      end if;
    end loop;
  end loop;
end;
$$ language plpgsql; 