const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const USERS = [
  {
    nombre: 'Administrador',
    email: 'admin@refaccionaria.com',
    password: 'Admin1234',
    rol: 'administrador',
  },
  {
    nombre: 'Empleado',
    email: 'empleado@refaccionaria.com',
    password: 'Empleado1234',
    rol: 'empleado',
  },
];

const PARTS = [
  {
    nombre: 'Filtro de aceite',
    descripcion: 'Filtro de aceite para motor 2.0',
    numero_parte: 'FO-12345',
    auto: 'Nissan Sentra 2018',
  },
  {
    nombre: 'Pastillas de freno delanteras',
    descripcion: 'Juego de pastillas ceramicas',
    numero_parte: 'PF-77821',
    auto: 'Volkswagen Jetta 2016',
  },
  {
    nombre: 'Bujia iridium',
    descripcion: 'Bujia de alta duracion',
    numero_parte: 'BJ-4410',
    auto: 'Chevrolet Aveo 2017',
  },
];

async function upsertUsers() {
  for (const user of USERS) {
    const password_hash = await bcrypt.hash(user.password, 10);
    const { data: existing, error: findError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    if (findError) throw new Error(findError.message);

    if (existing) {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: user.nombre,
          password_hash,
          rol: user.rol,
          activo: true,
        })
        .eq('id', existing.id);
      if (error) throw new Error(error.message);
      console.log(`Actualizado: ${user.email} (${user.rol})`);
    } else {
      const { error } = await supabase.from('usuarios').insert({
        nombre: user.nombre,
        email: user.email,
        password_hash,
        rol: user.rol,
        activo: true,
      });
      if (error) throw new Error(error.message);
      console.log(`Creado: ${user.email} (${user.rol})`);
    }
  }
}

async function upsertParts() {
  for (const part of PARTS) {
    const { data: existing, error: findError } = await supabase
      .from('piezas')
      .select('id')
      .eq('numero_parte', part.numero_parte)
      .maybeSingle();
    if (findError) throw new Error(findError.message);
    if (existing) continue;
    const { error } = await supabase.from('piezas').insert(part);
    if (error) throw new Error(error.message);
    console.log(`Pieza: ${part.nombre}`);
  }
}

async function main() {
  await upsertUsers();
  await upsertParts();
  console.log('Seed listo.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
