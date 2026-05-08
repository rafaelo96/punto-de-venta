# Variables de entorno para Render (Backend)

Configura estas variables en tu servicio de Render:

```
NODE_ENV=production
PORT=3000

# Base de datos (Supabase)
DB_HOST=aws-1-us-west-2.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.ttcnrqhzdnejrbqhddxi
DB_PASSWORD=Vyqb3FwMlG8KU9l6
DB_NAME=postgres

# JWT (cambia a los nuevos valores generados)
JWT_SECRET=9878d8bf7841747cb2dcad112cbf8361f01ee4cb78c33829f6e1abbeae0475c365a11a60587bad6fe48ef8b8b9916b025cdfa53c5aeed3be33eb668a614f3520
TICKET_SECRET=01cd79e17502bde34257996b70353454183152685307f96328820455cdfd84f26715f611127ddfd66c9ffd10b9438634afb214709ffa40ca15c8eb1b704caddb

# Frontend (Vercel)
FRONTEND_URL=https://punto-de-venta-chi.vercel.app
```

## PASOS PARA PRODUCCIÓN:

1. **Rotar contraseña de Supabase** (la actual está expuesta):
   - Ve a Supabase Dashboard > Settings > Database
   - Regenerate connection string
   - Actualiza `DB_PASSWORD` en Render

2. **Actualizar frontend/vercel.json**:
   - Reemplaza `REEMPLAZAR_CON_TU_BACKEND.onrender.com` con tu URL real
   - Ejemplo: `https://pos-backend-abc123.onrender.com`

3. **Redesplegar frontend** en Vercel después de actualizar vercel.json
