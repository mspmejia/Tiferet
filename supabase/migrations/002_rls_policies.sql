-- =====================================================
-- Tiferet Salud ERP — Row Level Security (RLS)
-- Migración 002: Políticas de acceso por rol
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineas_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobros ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;

-- Función auxiliar: obtener rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- POLÍTICAS: usuarios
-- =====================================================
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON usuarios FOR SELECT
  USING (id = auth.uid() OR get_user_role() IN ('admin', 'gerencia'));

CREATE POLICY "Solo admin puede crear usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin puede actualizar usuarios"
  ON usuarios FOR UPDATE
  USING (get_user_role() = 'admin' OR id = auth.uid());

-- =====================================================
-- POLÍTICAS: clientes
-- =====================================================
CREATE POLICY "Todos pueden ver clientes activos"
  ON clientes FOR SELECT
  USING (activo = true);

CREATE POLICY "Vendedores y admin pueden crear clientes"
  ON clientes FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'vendedor'));

CREATE POLICY "Vendedores editan sus propios clientes, admin edita todos"
  ON clientes FOR UPDATE
  USING (
    get_user_role() = 'admin' OR
    (get_user_role() = 'vendedor' AND vendedor_id = auth.uid())
  );

-- =====================================================
-- POLÍTICAS: productos e inventario
-- =====================================================
CREATE POLICY "Todos pueden ver productos activos"
  ON productos FOR SELECT
  USING (activo = true);

CREATE POLICY "Admin y bodega gestionan productos"
  ON productos FOR ALL
  USING (get_user_role() IN ('admin', 'bodega'));

CREATE POLICY "Todos pueden ver lotes"
  ON lotes_inventario FOR SELECT
  USING (true);

CREATE POLICY "Admin y bodega gestionan lotes"
  ON lotes_inventario FOR ALL
  USING (get_user_role() IN ('admin', 'bodega'));

-- =====================================================
-- POLÍTICAS: pedidos
-- =====================================================
CREATE POLICY "Vendedores ven sus pedidos, admin ve todos"
  ON pedidos FOR SELECT
  USING (
    get_user_role() IN ('admin', 'gerencia') OR
    vendedor_id = auth.uid() OR
    get_user_role() IN ('repartidor', 'bodega')
  );

CREATE POLICY "Vendedores y admin crean pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'vendedor'));

CREATE POLICY "Vendedor edita sus pedidos en borrador, admin edita todos"
  ON pedidos FOR UPDATE
  USING (
    get_user_role() = 'admin' OR
    (vendedor_id = auth.uid() AND estado = 'borrador')
  );

CREATE POLICY "Líneas de pedido: mismo acceso que pedido"
  ON lineas_pedido FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = pedido_id AND (
        get_user_role() IN ('admin', 'gerencia', 'bodega', 'repartidor') OR
        p.vendedor_id = auth.uid()
      )
    )
  );

-- =====================================================
-- POLÍTICAS: entregas
-- =====================================================
CREATE POLICY "Repartidores ven sus entregas, admin ve todas"
  ON entregas FOR SELECT
  USING (
    get_user_role() IN ('admin', 'gerencia', 'bodega') OR
    repartidor_id = auth.uid()
  );

CREATE POLICY "Admin y bodega crean entregas"
  ON entregas FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'bodega'));

CREATE POLICY "Repartidor actualiza sus entregas, admin actualiza todas"
  ON entregas FOR UPDATE
  USING (
    get_user_role() = 'admin' OR
    repartidor_id = auth.uid()
  );

-- =====================================================
-- POLÍTICAS: cobros
-- =====================================================
CREATE POLICY "Vendedores ven sus cobros, admin ve todos"
  ON cobros FOR SELECT
  USING (
    get_user_role() IN ('admin', 'gerencia') OR
    vendedor_id = auth.uid()
  );

CREATE POLICY "Vendedores y admin registran cobros"
  ON cobros FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'vendedor'));

-- =====================================================
-- POLÍTICAS: documentos y movimientos
-- =====================================================
CREATE POLICY "Todos pueden ver documentos"
  ON documentos FOR SELECT USING (true);

CREATE POLICY "Sistema inserta documentos"
  ON documentos FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'vendedor', 'bodega'));

CREATE POLICY "Todos pueden ver movimientos"
  ON movimientos_inventario FOR SELECT USING (true);

CREATE POLICY "Admin y bodega registran movimientos"
  ON movimientos_inventario FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'bodega'));
