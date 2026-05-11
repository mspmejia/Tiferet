// =========================================
// Tiferet Salud — Tipos compartidos
// Usados por apps/web y apps/mobile
// =========================================

// --- Roles y usuarios ---

export type UserRole = 'admin' | 'gerencia' | 'vendedor' | 'repartidor' | 'bodega'

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  rol: UserRole
  activo: boolean
  created_at: string
}

// --- Clientes ---

export interface Cliente {
  id: string
  nombre: string
  nit?: string
  direccion: string
  zona: string
  telefono?: string
  email?: string
  tipo: 'farmacia' | 'clinica' | 'distribuidor' | 'hospital'
  limite_credito: number
  dias_credito: number
  saldo_pendiente: number
  vendedor_id?: string
  activo: boolean
  created_at: string
}

// --- Proveedores / Laboratorios ---

export interface Proveedor {
  id: string
  nombre: string
  nit?: string
  contacto?: string
  telefono?: string
  email?: string
  activo: boolean
}

// --- Productos e Inventario ---

export interface Producto {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  proveedor_id: string
  unidad: 'caja' | 'frasco' | 'ampolla' | 'blister' | 'unidad'
  precio_compra: number
  precio_venta: number
  activo: boolean
}

export interface LoteInventario {
  id: string
  producto_id: string
  numero_lote: string
  fecha_vencimiento: string
  cantidad_inicial: number
  cantidad_actual: number
  ubicacion?: string
  created_at: string
}

export type AlertaStock = 'ok' | 'bajo' | 'critico' | 'sin_stock'

export interface ProductoConStock extends Producto {
  stock_total: number
  lotes: LoteInventario[]
  alerta: AlertaStock
}

// --- Pedidos ---

export type EstadoPedido = 'borrador' | 'confirmado' | 'en_preparacion' | 'despachado' | 'entregado' | 'cancelado'

export interface LineaPedido {
  id: string
  pedido_id: string
  producto_id: string
  lote_id?: string
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
  producto?: Producto
}

export interface Pedido {
  id: string
  numero: string
  cliente_id: string
  vendedor_id: string
  estado: EstadoPedido
  fecha_pedido: string
  fecha_entrega_estimada?: string
  forma_pago: 'contado' | 'credito_30' | 'credito_60' | 'transferencia'
  observaciones?: string
  subtotal: number
  descuento_total: number
  total: number
  lineas: LineaPedido[]
  cliente?: Cliente
  created_at: string
}

// --- Entregas ---

export type EstadoEntrega = 'pendiente' | 'en_ruta' | 'entregado' | 'no_entregado' | 'reprogramado'

export interface Entrega {
  id: string
  pedido_id: string
  repartidor_id: string
  estado: EstadoEntrega
  fecha_programada: string
  fecha_entrega?: string
  firma_url?: string
  foto_url?: string
  lat?: number
  lng?: number
  observaciones?: string
  pedido?: Pedido
}

// --- Cobros ---

export type MetodoPago = 'efectivo' | 'transferencia' | 'cheque' | 'deposito'

export interface Cobro {
  id: string
  cliente_id: string
  pedido_id?: string
  vendedor_id: string
  monto: number
  metodo: MetodoPago
  referencia?: string
  fecha: string
  observaciones?: string
  cliente?: Cliente
}

// --- Documentos ---

export type TipoDocumento = 'orden_entrega' | 'recibo' | 'factura' | 'remision' | 'recepcion'

export interface Documento {
  id: string
  tipo: TipoDocumento
  referencia_id: string
  numero: string
  pdf_url?: string
  created_at: string
}

// --- Respuestas API ---

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}
