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
    nombre: 'Balatas Duralast de Cerámica',
    descripcion: 'Modelo MKD1592. Balatas de cerámica, 1 año de garantía. SKU #511149',
    numero_parte: 'MKD1592',
    auto: 'Verificar compatibilidad con el vehículo',
  },
  {
    nombre: 'Balatas Duralast de Cerámica',
    descripcion: 'Modelo D866. Balatas de cerámica, 1 año de garantía. SKU #350087',
    numero_parte: 'D866',
    auto: 'Verificar compatibilidad con el vehículo',
  },
  {
    nombre: 'Balatas Duralast de Cerámica',
    descripcion: 'Modelo MKD1363. Balatas de cerámica, 1 año de garantía. SKU #208716',
    numero_parte: 'MKD1363',
    auto: 'Verificar compatibilidad con el vehículo',
  },
  {
    nombre: 'Marcha Remanufacturada Duralast',
    descripcion: 'Modelo DL3185. Marcha remanufacturada. SKU #986570',
    numero_parte: 'DL3185',
    auto: 'Verificar compatibilidad con el vehículo',
  },
  {
    nombre: 'Marcha Duralast',
    descripcion: 'Modelo DL3188. Marcha. SKU #842',
    numero_parte: 'DL3188',
    auto: 'Verificar compatibilidad con el vehículo',
  },
  {
    nombre: 'Marcha Duralast',
    descripcion: 'Modelo DL3191. Marcha. SKU #12342',
    numero_parte: 'DL3191',
    auto: 'Verificar compatibilidad con el vehículo',
  },
  {
    nombre: 'Batería Duralast de Plomo-Ácido',
    descripcion: 'Modelo 35-DL. Celda húmeda, libre de mantenimiento, 3 años de garantía. SKU #938907',
    numero_parte: '35-DL',
    auto: 'Verificar compatibilidad con el vehículo',
  },
  {
    nombre: 'Batería TotalPro de Plomo-Ácido',
    descripcion: 'Modelo 47-T. Celda húmeda, 2 años de garantía. SKU #288024',
    numero_parte: '47-T',
    auto: 'Verificar compatibilidad con el vehículo',
  },
  {
    nombre: 'Batería Valucraft de Plomo-Ácido',
    descripcion: 'Modelo 47-VL. Celda húmeda, libre de mantenimiento, 2 años de garantía. SKU #288024',
    numero_parte: '47-VL',
    auto: 'Verificar compatibilidad con el vehículo',
  },
];

const CARS = [
  {
    marca: 'Nissan',
    modelo: 'Sentra',
    anio: 2018,
    placa: 'ABC-123-A',
    propietario: 'Juan Perez',
    situacion: 'Falta reparacion',
    notas: 'Ruido en frenos delanteros',
  },
  {
    marca: 'Volkswagen',
    modelo: 'Jetta',
    anio: 2016,
    placa: 'XYZ-456-B',
    propietario: 'Maria Lopez',
    situacion: 'En proceso',
    notas: 'Cambio de balatas en proceso',
  },
  {
    marca: 'Chevrolet',
    modelo: 'Aveo',
    anio: 2017,
    placa: 'QWE-789-C',
    propietario: 'Carlos Ruiz',
    situacion: 'Terminado',
    notas: 'Servicio completo entregado',
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

async function upsertCars() {
  for (const car of CARS) {
    if (car.placa) {
      const { data: existing, error: findError } = await supabase
        .from('autos')
        .select('id')
        .eq('placa', car.placa)
        .maybeSingle();
      if (findError) throw new Error(findError.message);
      if (existing) continue;
    }
    const { error } = await supabase.from('autos').insert(car);
    if (error) throw new Error(error.message);
    console.log(`Auto: ${car.marca} ${car.modelo} (${car.situacion})`);
  }
}

async function main() {
  await upsertUsers();
  await upsertParts();
  await upsertCars();
  console.log('Seed listo.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
