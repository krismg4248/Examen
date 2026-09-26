# Examen TORQUE (monorepo)

Frontend Svelte + backend NestJS. En produccion un solo servicio sirve la UI y la API.

## Render (recomendado: 1 Web Service)

1. **Create New → Web Service**
2. Conecta el repo
3. Configura:

| Campo | Valor |
|---|---|
| **Root Directory** | *(vacio — raiz del repo)* |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

4. **Environment**

| Key | Value |
|---|---|
| `JWT_SECRET` | tu secreto |
| `JWT_EXPIRES_IN` | `8h` |
| `SUPABASE_URL` | URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role |
| `NODE_OPTIONS` | `--use-system-ca` |

La URL del servicio abre el front TORQUE. La API queda en `/api`.

No hace falta `VITE_API_URL` (el front usa `/api` en el mismo dominio).

## Local

```bash
# backend
cd backend && npm run start:dev

# frontend (otra terminal)
cd frontend && npm run dev
```
