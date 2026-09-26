-- Migracion segura: agrega tabla autos sin borrar usuarios/piezas.

create extension if not exists "pgcrypto";

create table if not exists autos (
  id uuid primary key default gen_random_uuid(),
  marca text not null,
  modelo text not null,
  anio integer,
  placa text unique,
  propietario text,
  situacion text not null default 'Falta reparacion'
    check (situacion in ('Falta reparacion', 'En proceso', 'Terminado')),
  notas text,
  created_at timestamptz not null default now()
);

alter table autos enable row level security;

drop policy if exists "service access autos" on autos;
create policy "service access autos" on autos for all using (true) with check (true);
