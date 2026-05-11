# ADR-001: Stack tecnológico del ERP Tiferet Salud

**Status:** Accepted  
**Date:** 2026-05-11  
**Deciders:** Tiferet Salud — equipo de desarrollo

---

## Contexto

Tiferet Salud es una empresa de distribución farmacéutica que necesita un sistema ERP/CRM para gestionar inventario, pedidos, entregas y cobros. Los usuarios principales son vendedores y repartidores que trabajan en ruta desde sus celulares. El sistema también necesita un dashboard web para administradores y gerencia.

**Restricciones clave:**
- Mobile-first obligatorio (mayoría de usuarios en ruta)
- Equipo pequeño de desarrollo
- Necesidad de MVP rápido
- Generación de documentos PDF (órdenes, facturas, recibos)
- Control de lotes y fechas de vencimiento
- Manejo de crédito y cobros

---

## Decisión

Usar un **monorepo Turborepo** con:
- **Next.js 14** (App Router) para el dashboard web de administración
- **Expo (React Native)** para la app móvil de vendedores y repartidores
- **Supabase** como backend completo (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
- **Drizzle ORM** para queries type-safe desde Next.js
- **@react-pdf/renderer** para generación de documentos PDF

---

## Opciones consideradas

### Opción A: Monorepo Next.js + Expo + Supabase ✅ (elegida)

| Dimensión | Evaluación |
|-----------|-----------|
| Complejidad setup | Media — monorepo requiere configuración inicial |
| Velocidad de desarrollo | Alta — Supabase elimina backend custom |
| Experiencia móvil | Alta — Expo nativo, acceso a cámara/GPS |
| Costo | Bajo — Supabase free tier generoso |
| Mantenimiento | Bajo — un solo repo, tipos compartidos |
| Escalabilidad | Alta — PostgreSQL, RLS, edge functions |

**Pros:**
- Tipos TypeScript compartidos entre web y mobile (packages/types)
- Supabase Auth maneja roles y permisos con Row Level Security
- Supabase Realtime para actualizaciones en vivo de inventario/pedidos
- Expo EAS para publicar actualizaciones OTA sin pasar por App Store
- Vercel + Supabase tienen tier gratuito suficiente para empezar

**Contras:**
- Configuración inicial de Turborepo más compleja que un proyecto simple
- Requiere conocimiento de Expo y Next.js en el mismo equipo

### Opción B: Next.js PWA única (sin app nativa)

| Dimensión | Evaluación |
|-----------|-----------|
| Complejidad | Baja — un solo proyecto |
| Experiencia móvil | Media — PWA limitada vs nativa |
| Acceso hardware | Bajo — sin acceso a GPS, cámara, Bluetooth |
| Offline | Limitado |

**Descartada:** La experiencia mobile es prioridad absoluta. Una PWA no da la fluidez requerida para usuarios en ruta que necesitan rapidez operativa.

### Opción C: Backend custom (Node.js/Express + PostgreSQL)

| Dimensión | Evaluación |
|-----------|-----------|
| Complejidad | Alta — API, Auth, Storage todo manual |
| Velocidad de desarrollo | Baja — meses adicionales de desarrollo backend |
| Costo | Medio-alto — hosting separado para API y DB |

**Descartada:** Supabase reemplaza el 80% del trabajo de backend custom sin sacrificar flexibilidad (PostgreSQL nativo).

---

## Consecuencias

**Qué se vuelve más fácil:**
- Autenticación con roles granulares (admin, vendedor, repartidor, bodega) via Supabase Auth
- Sincronización en tiempo real del inventario entre dispositivos
- Generación de PDF directamente desde Next.js API Routes
- Despliegue continuo: push a GitHub → Vercel deploya web automáticamente
- Actualizaciones de la app móvil sin pasar por revisión de App Store (Expo OTA)

**Qué se vuelve más difícil:**
- El equipo necesita conocer Expo/React Native además de React/Next.js
- Pruebas del monorepo requieren mayor coordinación entre packages

**A revisar en el futuro:**
- Si el volumen de datos crece, evaluar migrar a Supabase Pro (más conexiones, más storage)
- Si se requiere lógica de negocio muy compleja, considerar separar en Edge Functions dedicadas
- Evaluar soporte offline completo con sincronización eventual para zonas sin señal

---

## Estructura de roles y permisos

| Rol | Acceso web | Acceso mobile | Permisos |
|-----|-----------|---------------|----------|
| `admin` | Total | Total | CRUD completo |
| `gerencia` | Reportes, lectura | Lectura | Solo lectura + reportes |
| `vendedor` | Limitado | Total | Pedidos, clientes propios, cobros |
| `repartidor` | No | Entregas, inventario | Confirmación entregas |
| `bodega` | Inventario | Inventario | Stock, recepciones |

---

## Action Items

- [ ] Inicializar monorepo Turborepo con `create-turbo`
- [ ] Crear proyecto en Supabase (supabase.com)
- [ ] Configurar Next.js 14 en `apps/web/`
- [ ] Configurar Expo en `apps/mobile/`
- [ ] Crear `packages/types/` con tipos compartidos
- [ ] Escribir migraciones SQL (ADR-002)
- [ ] Configurar RLS policies en Supabase
- [ ] Conectar Vercel al repositorio GitHub
- [ ] Configurar Expo EAS para builds móviles
