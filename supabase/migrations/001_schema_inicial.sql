-- =====================================================
-- Tiferet Salud ERP — Schema inicial
-- Migración 001: Tablas core del sistema
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas rápidas de texto

-- =====================================================
-- TIPOS ENUM
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'gerencia', 'vendedor', 'repartidor', 'bodega');
CREATE TYPE tipo_cliente AS ENUM ('farmacia', 'clinica', 'distribuidor', 'hospital');
CREATE TYPE unidad_producto AS ENUM ('caja', 'frasco', 'ampolla', 'blister', 'unidad');
CREATE TYPE estado_pedido AS ENUM ('borrador', 'confirmado', 'en_preparacion', 'despachado', 'entregado', 'cancelado');
CREATE TYPE forma_pago AS ENUM ('contado', 'credito_30', 'credito_60', 'transferencia');
CREATE TYPE estado_entrega AS ENUM ('pendiente', 'en_ruta', 'entregado', 'no_entregado', 'reprogramado');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'transferencia', 'cheque', 'deposito');
CREATE TYPE tipo_documento AS ENUM ('orden_entrega', 'recibo', 'factura', 'remision', 'recepcion');

-- =====================================================
-- TABLA: usuarios (extiende auth.users de Supabase)
-- =====================================================
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  telefono    TEXT,
  rol         user_role NOT NULL DEFAULT 'vendedor',
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: proveedores (laboratorios)
-- =====================================================
CREATE TABLE proveedores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre     TEXT NOT NULL,
  nit        TEXT UNIQUE,
  contacto   TEXT,
  telefono   TEXT,
  email      TEXT,
  activo     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: clientes
-- =====================================================
CREATE TABLE clientes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre           TEXT NOT NULL,
  nit              TEXT,
  direccion        TEXT NOT NULL,
  zona             TEXT NOT NULL,
  telefono         TEXT,
  email            TEXT,
  tipo             tipo_cliente NOT NULL DEFAULT 'farmacia',
  limite_credito   DECIMAL(12,2) NOT NULL DEFAULT 0,
  dias_credito     INTEGER NOT NULL DEFAULT 0,
  vendedor_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  activo           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de búsqueda rápida
CREATE INDEX idx_clientes_nombre ON clientes USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_clientes_zona ON clientes(zona);
CREATE INDEX idx_clientes_vendedor ON clientes(vendedor_id);

-- =====================================================
-- TABLA: productos
-- =====================================================
CREATE TABLE productos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo         TEXT NOT NULL UNIQUE,
  nombre         TEXT NOT NULL,
  descripcion    TEXT,
  proveedor_id   UUID NOT NULL REFERENCES proveedores(id),
  unidad         unidad_producto NOT NULL DEFAULT 'caja',
  precio_compra  DECIMAL(12,2) NOT NULL DEFAULT 0,
  precio_venta   DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_minimo   INTEGER NOT NULL DEFAULT 0,
  activo         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_productos_nombre ON productos USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_productos_codigo ON productos(codigo);

-- =====================================================
-- TABLA: lotes_inventario
-- =====================================================
CREATE TABLE lotes_inventario (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id        UUID NOT NULL REFERENCES productos(id),
  numero_lote        TEXT NOT NULL,
  fecha_vencimiento  DATE NOT NULL,
  cantidad_inicial   INTEGER NOT NULL DEFAULT 0,
  cantidad_actual    INTEGER NOT NULL DEFAULT 0,
  ubicacion          TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lote_cantidad_positiva CHECK (cantidad_actual >= 0)
);

CREATE INDEX idx_lotes_producto ON lotes_inventario(producto_id);
CREATE INDEX idx_lotes_vencimiento ON lotes_inventario(fecha_vencimiento);

-- Vista: stock total por producto con alerta
CREATE VIEW v_stock_productos AS
  SELECT
    p.id,
    p.codigo,
    p.nombre,
    p.unidad,
    p.precio_venta,
    p.stock_minimo,
    COALESCE(SUM(l.cantidad_actual), 0) AS stock_total,
    MIN(l.fecha_vencimiento) AS proximo_vencimiento,
    CASE
      WHEN COALESCE(SUM(l.cantidad_actual), 0) = 0 THEN 'sin_stock'
      WHEN COALESCE(SUM(l.cantidad_actual), 0) <= p.stock_minimo THEN 'critico'
      WHEN COALESCE(SUM(l.cantidad_actual), 0) <= p.stock_minimo * 2 THEN 'bajo'
      ELSE 'ok'
    END AS alerta
  FROM productos p
  LEFT JOIN lotes_inventario l
    ON l.producto_id = p.id AND l.cantidad_actual > 0
  WHERE p.activo = true
  GROUP BY p.id;

-- =====================================================
-- TABLA: pedidos
-- =====================================================
CREATE TABLE pedidos (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero                  TEXT NOT NULL UNIQUE,
  cliente_id              UUID NOT NULL REFERENCES clientes(id),
  vendedor_id             UUID NOT NULL REFERENCES usuarios(id),
  estado                  estado_pedido NOT NULL DEFAULT 'borrador',
  fecha_pedido            TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_entrega_estimada  DATE,
  forma_pago              forma_pago NOT NULL DEFAULT 'contado',
  observaciones           TEXT,
  subtotal                DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento_total         DECIMAL(12,2) NOT NULL DEFAULT 0,
  total                   DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_vendedor ON pedidos(vendedor_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido DESC);

-- Secuencia para numeración de pedidos
CREATE SEQUENCE seq_pedidos START 1000;

-- Función para auto-numerar pedidos
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero := 'PED-' || LPAD(nextval('seq_pedidos')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_numero_pedido
  BEFORE INSERT ON pedidos
  FOR EACH ROW EXECUTE FUNCTION generar_numero_pedido();

-- =====================================================
-- TABLA: lineas_pedido
-- =====================================================
CREATE TABLE lineas_pedido (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id       UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id     UUID NOT NULL REFERENCES productos(id),
  lote_id         UUID REFERENCES lotes_inventario(id),
  cantidad        INTEGER NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  descuento       DECIMAL(5,2) NOT NULL DEFAULT 0,
  subtotal        DECIMAL(12,2) GENERATED ALWAYS AS
                    (cantidad * precio_unitario * (1 - descuento / 100)) STORED,
  CONSTRAINT linea_cantidad_positiva CHECK (cantidad > 0),
  CONSTRAINT linea_descuento_rango CHECK (descuento >= 0 AND descuento <= 100)
);

CREATE INDEX idx_lineas_pedido ON lineas_pedido(pedido_id);

-- =====================================================
-- TABLA: entregas
-- =====================================================
CREATE TABLE entregas (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id         UUID NOT NULL REFERENCES pedidos(id),
  repartidor_id     UUID NOT NULL REFERENCES usuarios(id),
  estado            estado_entrega NOT NULL DEFAULT 'pendiente',
  fecha_programada  DATE NOT NULL,
  fecha_entrega     TIMESTAMPTZ,
  firma_url         TEXT,
  foto_url          TEXT,
  lat               DECIMAL(10,7),
  lng               DECIMAL(10,7),
  observaciones     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entregas_repartidor ON entregas(repartidor_id);
CREATE INDEX idx_entregas_estado ON entregas(estado);
CREATE INDEX idx_entregas_fecha ON entregas(fecha_programada);

-- =====================================================
-- TABLA: cobros
-- =====================================================
CREATE TABLE cobros (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id   UUID NOT NULL REFERENCES clientes(id),
  pedido_id    UUID REFERENCES pedidos(id),
  vendedor_id  UUID NOT NULL REFERENCES usuarios(id),
  monto        DECIMAL(12,2) NOT NULL,
  metodo       metodo_pago NOT NULL DEFAULT 'efectivo',
  referencia   TEXT,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT now(),
  observaciones TEXT,
  CONSTRAINT cobro_monto_positivo CHECK (monto > 0)
);

CREATE INDEX idx_cobros_cliente ON cobros(cliente_id);
CREATE INDEX idx_cobros_vendedor ON cobros(vendedor_id);
CREATE INDEX idx_cobros_fecha ON cobros(fecha DESC);

-- Vista: saldo pendiente por cliente
CREATE VIEW v_saldos_clientes AS
  SELECT
    c.id,
    c.nombre,
    c.zona,
    c.limite_credito,
    c.dias_credito,
    COALESCE(SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado')), 0) AS total_facturado,
    COALESCE(SUM(co.monto), 0) AS total_cobrado,
    COALESCE(SUM(p.total) FILTER (WHERE p.estado NOT IN ('cancelado')), 0)
      - COALESCE(SUM(co.monto), 0) AS saldo_pendiente
  FROM clientes c
  LEFT JOIN pedidos p ON p.cliente_id = c.id
  LEFT JOIN cobros co ON co.cliente_id = c.id
  WHERE c.activo = true
  GROUP BY c.id;

-- =====================================================
-- TABLA: documentos
-- =====================================================
CREATE TABLE documentos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo           tipo_documento NOT NULL,
  referencia_id  UUID NOT NULL,
  numero         TEXT NOT NULL,
  pdf_url        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: movimientos_inventario (trazabilidad)
-- =====================================================
CREATE TABLE movimientos_inventario (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id      UUID NOT NULL REFERENCES lotes_inventario(id),
  tipo         TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad     INTEGER NOT NULL,
  referencia   TEXT, -- número de pedido, recepción, etc.
  usuario_id   UUID REFERENCES usuarios(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimientos_lote ON movimientos_inventario(lote_id);

-- =====================================================
-- FUNCIÓN: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_productos_updated_at BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_pedidos_updated_at BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_entregas_updated_at BEFORE UPDATE ON entregas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
