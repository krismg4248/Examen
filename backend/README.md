# Backend refaccionaria (NestJS + Supabase + bcrypt)

Sistema de administracion con **dos tablas** (`usuarios` y `piezas`) y **dos roles**.

| Rol | Permisos |
|---|---|
| `administrador` | Consultar, registrar, modificar y borrar piezas. Gestionar usuarios. |
| `empleado` | Solo consultar piezas. |

## Arranque

1. Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase (si las tablas aun no existen).
2. Configura `.env` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
3. Siembra usuarios de prueba:

```bash
cd backend
npm run seed
npm run start:dev
```

API: `http://localhost:3000/api`

## Usuarios de prueba

| Rol | Email | Contrasena |
|---|---|---|
| Administrador | `admin@refaccionaria.com` | `Admin1234` |
| Empleado | `empleado@refaccionaria.com` | `Empleado1234` |

Las contrasenas se guardan cifradas con bcrypt.

`POST /api/auth/login`

```json
{
  "email": "admin@refaccionaria.com",
  "password": "Admin1234"
}
```

Usa `Authorization: Bearer <access_token>`.

## Endpoints

| Metodo | Ruta | Quien |
|---|---|---|
| POST | `/api/auth/login` | publico |
| GET | `/api/auth/me` | ambos |
| POST | `/api/auth/registro` | administrador |
| GET | `/api/usuarios` | administrador |
| GET | `/api/piezas` | ambos |
| POST / PATCH / DELETE | `/api/piezas` | administrador |

### Ejemplo de pieza

```json
{
  "nombre": "Filtro de aceite",
  "descripcion": "Filtro original para motor 2.0",
  "numero_parte": "FO-12345",
  "auto": "Nissan Sentra 2018"
}
```
