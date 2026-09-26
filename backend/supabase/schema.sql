-- Tablas para el sistema de administracion de refaccionaria.
-- Ejecutar en Supabase: SQL Editor -> New query -> Run.

create extension if not exists "pgcrypto";

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null default 'empleado' check (rol in ('admin', 'empleado', 'cajero')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  created_at timestamptz not null default now()
);

create table if not exists marcas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  pais_origen text,
  created_at timestamptz not null default now()
);

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  nombre text not null,
  descripcion text,
  categoria_id uuid references categorias(id) on delete set null,
  marca_id uuid references marcas(id) on delete set null,
  precio numeric(12, 2) not null default 0,
  stock integer not null default 0,
  stock_minimo integer not null default 5,
  unidad text not null default 'pza',
  compatible_con text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  rfc text,
  direccion text,
  created_at timestamptz not null default now()
);

create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text,
  telefono text,
  email text,
  rfc text,
  created_at timestamptz not null default now()
);

create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  cliente_id uuid references clientes(id) on delete set null,
  usuario_id uuid references usuarios(id) on delete set null,
  subtotal numeric(12, 2) not null default 0,
  iva numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  metodo_pago text not null default 'efectivo' check (metodo_pago in ('efectivo', 'tarjeta', 'transferencia')),
  created_at timestamptz not null default now()
);

create table if not exists venta_detalle (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas(id) on delete cascade,
  producto_id uuid not null references productos(id),
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(12, 2) not null,
  importe numeric(12, 2) not null
);

alter table usuarios enable row level security;
alter table categorias enable row level security;
alter table marcas enable row level security;
alter table productos enable row level security;
alter table clientes enable row level security;
alter table proveedores enable row level security;
alter table ventas enable row level security;
alter table venta_detalle enable row level security;

-- El backend usa la service role key, que ignora RLS.
-- Estas politicas cubren consultas desde el cliente de Supabase si se usa despues.

create policy "service access usuarios" on usuarios for all using (true) with check (true);
create policy "service access categorias" on categorias for all using (true) with check (true);
create policy "service access marcas" on marcas for all using (true) with check (true);
create policy "service access productos" on productos for all using (true) with check (true);
create policy "service access clientes" on clientes for all using (true) with check (true);
create policy "service access proveedores" on proveedores for all using (true) with check (true);
create policy "service access ventas" on ventas for all using (true) with check (true);
create policy "service access venta_detalle" on venta_detalle for all using (true) with check (true);

create or replace function registrar_venta(
  p_cliente_id uuid,
  p_usuario_id uuid,
  p_metodo_pago text,
  p_items jsonb
) returns json
language plpgsql
as $$
declare
  v_venta_id uuid;
  v_folio text;
  v_subtotal numeric := 0;
  v_iva numeric;
  v_total numeric;
  item jsonb;
  v_precio numeric;
  v_stock integer;
  v_nombre text;
  v_cantidad integer;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_cantidad := (item->>'cantidad')::int;
    select precio, stock, nombre into v_precio, v_stock, v_nombre
    from productos
    where id = (item->>'producto_id')::uuid
    for update;

    if not found then
      raise exception 'Producto no encontrado';
    end if;
    if v_stock < v_cantidad then
      raise exception 'Stock insuficiente para %', v_nombre;
    end if;

    v_subtotal := v_subtotal + (v_precio * v_cantidad);
  end loop;

  v_iva := round(v_subtotal * 0.16, 2);
  v_total := v_subtotal + v_iva;
  v_folio := 'V-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || substr(gen_random_uuid()::text, 1, 4);

  insert into ventas (folio, cliente_id, usuario_id, subtotal, iva, total, metodo_pago)
  values (v_folio, p_cliente_id, p_usuario_id, v_subtotal, v_iva, v_total, p_metodo_pago)
  returning id into v_venta_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_cantidad := (item->>'cantidad')::int;
    select precio into v_precio from productos where id = (item->>'producto_id')::uuid;

    insert into venta_detalle (venta_id, producto_id, cantidad, precio_unitario, importe)
    values (v_venta_id, (item->>'producto_id')::uuid, v_cantidad, v_precio, v_precio * v_cantidad);

    update productos
      set stock = stock - v_cantidad
      where id = (item->>'producto_id')::uuid;
  end loop;

  return json_build_object(
    'id', v_venta_id,
    'folio', v_folio,
    'subtotal', v_subtotal,
    'iva', v_iva,
    'total', v_total
  );
end;
$$;
