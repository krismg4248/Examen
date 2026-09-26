-- Tablas: usuarios, piezas y autos.

create extension if not exists "pgcrypto";

drop table if exists venta_detalle cascade;
drop table if exists ventas cascade;
drop table if exists productos cascade;
drop table if exists categorias cascade;
drop table if exists marcas cascade;
drop table if exists clientes cascade;
drop table if exists proveedores cascade;

drop table if exists piezas cascade;
drop table if exists autos cascade;
drop table if exists usuarios cascade;

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null default 'empleado' check (rol in ('administrador', 'empleado')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table piezas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  numero_parte text not null unique,
  auto text not null,
  created_at timestamptz not null default now()
);

create table autos (
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

alter table usuarios enable row level security;
alter table piezas enable row level security;
alter table autos enable row level security;

drop policy if exists "service access usuarios" on usuarios;
drop policy if exists "service access piezas" on piezas;
drop policy if exists "service access autos" on autos;

create policy "service access usuarios" on usuarios for all using (true) with check (true);
create policy "service access piezas" on piezas for all using (true) with check (true);
create policy "service access autos" on autos for all using (true) with check (true);
