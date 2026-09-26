# Despliegue monorepo en Render (un solo Web Service)

Sirve el **front TORQUE** en `/` y la **API** en `/api`.

## Edita tu Web Service actual

1. En Render → tu servicio → **Settings**
2. Cambia esto:

| Campo | Valor correcto |
|---|---|
| **Root Directory** | *(dejalo vacio — raiz del repo)* |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

3. Environment (mantenlas):

| Key | Value |
|---|---|
| `JWT_SECRET` | tu secreto |
| `JWT_EXPIRES_IN` | `8h` |
| `SUPABASE_URL` | URL Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role |
| `NODE_OPTIONS` | `--use-system-ca` |
| `NODE_VERSION` | `22` |

4. **Manual Deploy → Deploy latest commit** (despues de subir estos cambios a `main`).

No uses Static Site aparte ni Root Directory = `backend`.
No hace falta `VITE_API_URL` (el front usa `/api` del mismo dominio).

Resultado: `https://tu-app.onrender.com` → login TORQUE  
API: `https://tu-app.onrender.com/api/...`
