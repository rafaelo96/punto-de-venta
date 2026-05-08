# Guía de Despliegue a Producción

## 1. BACKEND (Render)

### Paso 1: Desplegar backend en Render
1. Ve a https://dashboard.render.com
2. Click "New +" > "Web Service"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: `pos-backend` (o el nombre que prefieras)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

### Paso 2: Configurar variables de entorno en Render
En "Environment" tab, agrega:

```env
NODE_ENV=production
PORT=3000

# Base de datos (Supabase)
DB_HOST=aws-1-us-west-2.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.ttcnrqhzdnejrbqhddxi
DB_PASSWORD=Vyqb3FwMlG8KU9l6
DB_NAME=postgres

# JWT (usar los nuevos generados)
JWT_SECRET=9878d8bf7841747cb2dcad112cbf8361f01ee4cb78c33829f6e1abbeae0475c365a11a60587bad6fe48ef8b8b9916b025cdfa53c5aeed3be33eb668a614f3520
TICKET_SECRET=01cd79e17502bde34257996b70353454183152685307f96328820455cdfd84f26715f611127ddfd66c9ffd10b9438634afb214709ffa40ca15c8eb1b704caddb

# Frontend URL
FRONTEND_URL=https://punto-de-venta-chi.vercel.app
```

### Paso 3: Obtener URL del backend
Después del despliegue, Render te dará una URL como:
`https://pos-backend-abc123.onrender.com`

**Copia esta URL completa.**

---

## 2. FRONTEND (Vercel)

### Paso 1: Actualizar vercel.json
Edita `frontend/vercel.json` y reemplaza `TU-BACKEND-REAL` con tu URL de Render:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://pos-backend-abc123.onrender.com/api/:path*"
    },
    {
      "source": "/uploads/:path*",
      "destination": "https://pos-backend-abc123.onrender.com/uploads/:path*"
    }
  ]
}
```

### Paso 2: Configurar variables en Vercel
En Vercel dashboard > Settings > Environment Variables:
```
VITE_API_URL=https://pos-backend-abc123.onrender.com
```

### Paso 3: Redesplegar
```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

---

## 3. ROTAR CREDENCIALES (CRÍTICO)

### En Supabase:
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Settings > Database > Connection string
4. Click "Reset password" o "Regenerate"
5. Actualiza `DB_PASSWORD` en Render con la nueva contraseña

---

## 4. VERIFICACIÓN

### Test del backend:
```bash
curl https://pos-backend-abc123.onrender.com/api/health
```

### Test del frontend:
1. Ve a https://punto-de-venta-chi.vercel.app
2. Intenta hacer login
3. Verifica que puedes ver productos, categorías, etc.
