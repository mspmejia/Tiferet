# Tiferet Salud — ERP/CRM

Sistema ERP y CRM para distribución farmacéutica. Mobile-first, diseñado para vendedores y repartidores en ruta.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Web (admin) | Next.js 14 + App Router + TypeScript + Tailwind CSS |
| Mobile (ruta) | Expo (React Native) + TypeScript |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Monorepo | Turborepo |
| PDF | @react-pdf/renderer |
| Deploy web | Vercel |
| Deploy mobile | Expo EAS |

## Estructura del monorepo

```
tiferet/
├── apps/
│   ├── web/              # Dashboard admin (Next.js 14)
│   └── mobile/           # App vendedores/repartidores (Expo)
├── packages/
│   ├── types/            # Tipos TypeScript compartidos
│   ├── supabase/         # Cliente Supabase + tipos generados
│   └── utils/            # Utilidades compartidas
├── supabase/
│   ├── migrations/       # Schema SQL
│   └── seed/             # Datos de prueba
├── docs/
│   └── adr/              # Architecture Decision Records
├── package.json
└── turbo.json
```

## Módulos del sistema

- **Usuarios y roles** — admin, vendedor, repartidor, bodega
- **Clientes** — farmacias, clínicas, distribuidores con crédito y zonas
- **Proveedores** — laboratorios y compras
- **Inventario** — productos, lotes, vencimientos, stock en tiempo real
- **Pedidos** — creación rápida desde móvil, líneas de producto
- **Entregas** — despacho, rutas, confirmación con firma digital
- **Cobros** — pagos, seguimiento de crédito, historial
- **Documentos** — PDF de órdenes, facturas, recibos, recepciones

## Flujo operativo

```
Compra a laboratorio → Ingreso inventario → Control lotes/vencimientos
→ Venta → Preparación pedido → Reparto → Entrega y firma
→ Cobro → Seguimiento crédito
```

## Configuración inicial

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# Correr migraciones Supabase
npx supabase db push

# Desarrollo
npm run dev
```

## Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
