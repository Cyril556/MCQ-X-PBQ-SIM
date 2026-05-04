create or replace function public.current_device_id()
returns uuid
language sql
stable
set search_path = public
as $$
  select nullif(
    current_setting('request.headers', true)::json->>'x-device-id',
    ''
  )::uuid
$$;