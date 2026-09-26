# Backend refaccionaria (NestJS + Supabase + bcrypt)

API de administracion para inventario, clientes, proveedores y ventas.

## 1. Crear proyecto en Supabase

1. Entra a [https://supabase.com](https://supabase.com) y crea un proyecto.
2. Copia **Project URL** y **service_role** (Settings > API). Usa `service_role` solo en el backend.
3. En **SQL Editor**, pega y ejecuta `supabase/schema.sql`.

## 2. Configurar el backend

```bash
cd backend
copy .env.example .env
```

Edita `.env`:

```
PORT=3000
JWT_SECRET=una-clave-larga-y-secreta
JWT_EXPIRES_IN=8h
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

```bash
npm install
npm run start:dev
```

La API queda en `http://localhost:3000/api`.

## 3. Autenticacion

Las contrasenas se cifran con **bcrypt** (libreria `bcryptjs`, 10 rounds) antes de guardarse en `usuarios.password_hash`. El login compara con `bcrypt.compare` y entrega un JWT.

### Registrar usuario

`POST /api/auth/registro`

```json
{
  "nombre": "Admin Taller",
  "email": "admin@refaccionaria.com",
  "password": "secreto123",
  "rol": "admin"
}
```

Roles: `admin`, `empleado`, `cajero`.

### Iniciar sesion

`POST /api/auth/login`

```json
{
  "email": "admin@refaccionaria.com",
  "password": "secreto123"
}
```

Usa el `access_token` en el header: `Authorization: Bearer <token>`.

## 4. Endpoints

| Recurso | Ruta | Notas |
|---|---|---|
| Auth | `/api/auth/registro`, `/login`, `/me` | bcrypt + JWT |
| Usuarios | `/api/usuarios` | solo admin |
| Categorias | `/api/categorias` | filtros, frenos, electrico, etc. |
| Marcas | `/api/marcas` | Bosch, Monroe, NGK... |
| Productos | `/api/productos` | SKU, stock, compatibilidad |
| Bajo stock | `/api/productos/bajo-stock` | alerta de reorden |
| Ajuste stock | `PATCH /api/productos/:id/stock` | `{ "cantidad": 10 }` o negativa |
| Clientes | `/api/clientes` | RFC y contacto |
| Proveedores | `/api/proveedores` | mayoreo |
| Ventas | `/api/ventas` | descuenta stock y calcula IVA 16% |

### Ejemplo de venta

`POST /api/ventas`

```json
{
  "cliente_id": "uuid-opcional",
  "metodo_pago": "efectivo",
  "items": [
    { "producto_id": "uuid-producto", "cantidad": 2 }
  ]
}
```
