-- =====================================================
-- Tiferet Salud ERP — Datos de prueba
-- Ejecutar solo en entorno de desarrollo
-- =====================================================

-- Proveedores de prueba
INSERT INTO proveedores (id, nombre, nit, contacto, telefono) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Laboratorio Roche Guatemala', '12345678', 'Carlos Pérez', '2234-5678'),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Pfizer Guatemala', '87654321', 'Ana López', '2345-6789'),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'MSD Guatemala', '11223344', 'Luis García', '2456-7890');

-- Productos de prueba
INSERT INTO productos (codigo, nombre, proveedor_id, unidad, precio_compra, precio_venta, stock_minimo) VALUES
  ('AMOX500', 'Amoxicilina 500mg x100 caps', 'a1b2c3d4-0001-0001-0001-000000000001', 'caja', 30.00, 45.00, 50),
  ('IBU400', 'Ibuprofeno 400mg x50 tabs', 'a1b2c3d4-0001-0001-0001-000000000002', 'caja', 18.50, 28.50, 30),
  ('DIC75', 'Diclofenac 75mg amp x3', 'a1b2c3d4-0001-0001-0001-000000000001', 'caja', 25.00, 38.00, 20),
  ('MET850', 'Metformina 850mg x30 tabs', 'a1b2c3d4-0001-0001-0001-000000000003', 'caja', 40.00, 62.00, 40),
  ('OMEP20', 'Omeprazol 20mg x14 caps', 'a1b2c3d4-0001-0001-0001-000000000002', 'caja', 22.00, 35.00, 25);

-- Clientes de prueba (sin vendedor_id — asignar después)
INSERT INTO clientes (nombre, nit, direccion, zona, telefono, tipo, limite_credito, dias_credito) VALUES
  ('Farmacia El Sol', '55566677', '6a Av 12-34 Zona 10', 'Zona 10', '2345-6789', 'farmacia', 10000.00, 30),
  ('Droguería Central', '44455566', '5a Calle 8-12 Zona 1', 'Zona 1', '2234-5678', 'distribuidor', 25000.00, 60),
  ('Clínica San José', '33344455', '12a Av 5-67 Zona 5', 'Zona 5', '2456-7890', 'clinica', 15000.00, 30),
  ('Farmacia del Norte', '22233344', '18 Calle 23-45 Zona 18', 'Zona 18', '2567-8901', 'farmacia', 5000.00, 30),
  ('Hospital General Privado', '11122233', '9a Av 18-23 Zona 9', 'Zona 9', '2678-9012', 'hospital', 50000.00, 60);
