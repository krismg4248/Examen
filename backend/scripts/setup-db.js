const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

function loadEnv() {
  const raw = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

async function runSql(url, key, query) {
  const endpoints = [`${url}/pg/query`, `${url}/pg-meta/default/query`];
  const errors = [];
  for (const endpoint of endpoints) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const text = await res.text();
    if (res.ok) return { ok: true, endpoint };
    errors.push(`${endpoint} -> ${res.status} ${text.slice(0, 200)}`);
  }
  return { ok: false, errors };
}

async function main() {
  const env = loadEnv();
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const sql = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'schema.sql'),
    'utf8',
  );

  const sqlResult = await runSql(url, key, sql);
  if (!sqlResult.ok) {
    console.log('No se pudo aplicar el SQL por API automatica.');
    console.log(sqlResult.errors.join('\n'));
    console.log('Si las tablas no existen, pega backend/supabase/schema.sql en el SQL Editor de Supabase.');
  } else {
    console.log('Schema aplicado via', sqlResult.endpoint);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminHash = await bcrypt.hash('Admin1234', 10);
  const empHash = await bcrypt.hash('Empleado1234', 10);

  const users = [
    {
      nombre: 'Administrador',
      email: 'admin@refaccionaria.com',
      password_hash: adminHash,
      rol: 'administrador',
    },
    {
      nombre: 'Empleado',
      email: 'empleado@refaccionaria.com',
      password_hash: empHash,
      rol: 'empleado',
    },
  ];

  for (const user of users) {
    const { error } = await supabase.from('usuarios').upsert(user, {
      onConflict: 'email',
    });
    if (error) {
      console.error('Error usuario', user.email, error.message);
      process.exitCode = 1;
    } else {
      console.log('Usuario listo:', user.email, user.rol);
    }
  }

  const { data: existingParts } = await supabase.from('piezas').select('id').limit(1);
  if (!existingParts || existingParts.length === 0) {
    const { error } = await supabase.from('piezas').insert([
      {
        nombre: 'Filtro de aceite',
        descripcion: 'Filtro de aceite original',
        numero_parte: 'FO-001',
        auto: 'Nissan Versa 2020',
      },
      {
        nombre: 'Pastillas de freno delanteras',
        descripcion: 'Juego de pastillas ceramicas',
        numero_parte: 'PF-220',
        auto: 'Volkswagen Jetta 2018',
      },
    ]);
    if (error) console.error('Error piezas:', error.message);
    else console.log('Piezas de ejemplo insertadas');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
