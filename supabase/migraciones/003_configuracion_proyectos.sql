alter table public.proyecto
add column if not exists configuracion jsonb not null default '{}'::jsonb;
