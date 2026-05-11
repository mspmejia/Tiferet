# Setup — Activar Tiferet Salud ERP

Guía paso a paso para levantar el sistema completo desde cero.

---

## 1. Subir código a GitHub

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "feat: estructura inicial ERP Tiferet Salud"
git branch -M main
git remote add origin https://github.com/mspmejia/Tiferet.git
git push -u origin main
```

---

## 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Nombre: `tiferet-erp`
3. Región: `South America (São Paulo)` o `US East`
4. Generar una contraseña fuerte para la base de datos y guardarla
5. Esperar ~2 minutos a que el proyecto inicie

### Obtener las keys:

En el dashboard de Supabase → **Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL     → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY → anon / public key
SUPABASE_SERVICE_ROLE_KEY    → service_role key (solo para server)
```

---

## 3. Correr las migraciones SQL

En Supabase → **SQL Editor** → **New query**:

1. Copiar y ejecutar `supabase/migrations/001_schema_inicial.sql`
2. Copiar y ejecutar `supabase/migrations/002_rls_policies.sql`
3. Copiar y ejecutar `supabase/seed/001_datos_prueba.sql` (solo en desarrollo)

Verificar en **Table Editor** que aparecen: `usuarios`, `clientes`, `productos`, `pedidos`, etc.

---

## 4. Crear el primer usuario admin

En Supabase → **Authentication → Users → Invite user**:

- Email: `tu-email@empresa.com`
- El usuario recibirá un email para crear su contraseña

Luego en SQL Editor, insertar el perfil del usuario admin:

```sql
-- Reemplazar el UUID con el ID real del usuario creado
INSERT INTO usuarios (id, nombre, apellido, telefono, rol)
VALUES (
  'uuid-del-usuario-aqui',  -- copiarlo de Authentication → Users
  'Tu Nombre',
  'Tu Apellido',
  '5555-5555',
  'admin'
);
```

---

## 5. Configurar variables de entorno — Web

Crear `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

---

## 6. Configurar variables de entorno — Mobile

Crear `apps/mobile/.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

---

## 7. Instalar dependencias y levantar el proyecto

```bash
# Desde la raíz del monorepo
npm install

# Levantar web (Next.js en http://localhost:3000)
npm run dev --workspace=apps/web

# En otra terminal — levantar mobile (Expo)
npm run start --workspace=apps/mobile
# Luego escanear el QR con Expo Go en el celular
```

---

## 8. Conectar Vercel para deploy automático (web)

1. Ir a [vercel.com](https://vercel.com) → **New Project**
2. Importar repositorio `mspmejia/Tiferet`
3. **Root Directory**: `apps/web`
4. **Framework Preset**: Next.js (automático)
5. Agregar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Click **Deploy**

Cada `git push` a `main` desplegará automáticamente.

---

## 9. Agregar secrets a GitHub para CI/CD

En GitHub → repo **Settings → Secrets → Actions**:

| Secret | Valor |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `VERCEL_TOKEN` | Token de Vercel (vercel.com → Settings → Tokens) |
| `VERCEL_ORG_ID` | ID de organización Vercel |
| `VERCEL_PROJECT_ID` | ID del proyecto Vercel |

---

## 10. Publicar app móvil (cuando esté lista)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login a Expo
eas login

# Configurar build
cd apps/mobile
eas build:configure

# Build para Android (APK)
eas build --platform android --profile preview

# Cuando esté aprobado, publicar a Play Store
eas submit --platform android
```

---

## Estructura de usuarios y roles

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `admin` | Administrador del sistema | Todo |
| `gerencia` | Gerencia y reportes | Lectura + reportes |
| `vendedor` | Vendedores en ruta | Pedidos, clientes propios, cobros |
| `repartidor` | Repartidores | Confirmación de entregas |
| `bodega` | Personal de bodega | Inventario, recepciones |

---

## Comandos útiles durante el desarrollo

```bash
# Ver todos los workspaces
npm ls --workspaces

# Build de todos los paquetes
npm run build

# Type-check todo el monorepo
npm run type-check

# Agregar dependencia a un workspace específico
npm install nombre-paquete --workspace=apps/web

# Resetear base de datos Supabase (development)
# En Supabase SQL Editor:
# DROP SCHEMA public CASCADE; CREATE SCHEMA public;
# Luego correr las migraciones de nuevo
```
