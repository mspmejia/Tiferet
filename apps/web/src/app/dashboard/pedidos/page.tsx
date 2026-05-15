'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/Modal'

type Pedido = {
  id: string
  numero: string
  estado: string
  forma_pago: string
  total: number
  fecha_pedido: string
  clientes: { nombre: string } | null
  usuarios: { nombre: string; apellido: string } | null
}

type Cliente = { id: string; nombre: string }
type Producto = { id: string; nombre: string; codigo: string; precio_venta: number; stock_total: number }

type LineaPedido = {
  producto_id: string
  nombre: string
  cantidad: number
  precio_unitario: number
  descuento: number
}

const ESTADO_COLOR: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  confirmado: 'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-yellow-100 text-yellow-700',
  despachado: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
}

const FORMAS_PAGO = ['contado', 'credito', 'cheque', 'transferencia']

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lineas, setLineas] = useState<LineaPedido[]>([])
  const [form, setForm] = useState({
    cliente_id: '',
    forma_pago: 'contado',
    notas: '',
    producto_id: '',
    cantidad: '1',
  })

  const supabase = createClient()

  const cargar = async () => {
    const [{ data: peds }, { data: cls }, { data: prods }] = await Promise.all([
      supabase.from('pedidos').select('*, clientes(nombre), usuarios(nombre, apellido)').order('fecha_pedido', { ascending: false }),
      supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
      supabase.from('v_stock_productos').select('id, nombre, codigo, precio_venta, stock_total').order('nombre'),
    ])
    setPedidos((peds as Pedido[]) ?? [])
    setClientes((cls as Cliente[]) ?? [])
    setProductos((prods as Producto[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = pedidos.filter(p =>
    p.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.clientes?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPedido = lineas.reduce((sum, l) => sum + (l.cantidad * l.precio_unitario * (1 - l.descuento / 100)), 0)

  const agregarLinea = () => {
    const prod = productos.find(p => p.id === form.producto_id)
    if (!prod || parseInt(form.cantidad) <= 0) return
    const existente = lineas.findIndex(l => l.producto_id === prod.id)
    if (existente >= 0) {
      const updated = [...lineas]
      updated[existente].cantidad += parseInt(form.cantidad)
      setLineas(updated)
    } else {
      setLineas([...lineas, {
        producto_id: prod.id,
        nombre: prod.nombre,
        cantidad: parseInt(form.cantidad),
        precio_unitario: prod.precio_venta,
        descuento: 0,
      }])
    }
    setForm({ ...form, producto_id: '', cantidad: '1' })
  }

  const quitarLinea = (idx: number) => {
    setLineas(lineas.filter((_, i) => i !== idx))
  }

  const handleGuardar = async () => {
    if (!form.cliente_id || lineas.length === 0) return
    setSaving(true)

    const numero = `PED-${Date.now().toString().slice(-6)}`
    const { data: pedido } = await supabase.from('pedidos').insert({
      numero,
      cliente_id: form.cliente_id,
      forma_pago: form.forma_pago,
      notas: form.notas || null,
      estado: 'confirmado',
      total: totalPedido,
    }).select().single()

    if (pedido) {
      await supabase.from('pedido_items').insert(
        lineas.map(l => ({
          pedido_id: pedido.id,
          producto_id: l.producto_id,
          cantidad: l.cantidad,
          precio_unitario: l.precio_unitario,
          descuento: l.descuento,
          subtotal: l.cantidad * l.precio_unitario * (1 - l.descuento / 100),
        }))
      )
    }

    setShowModal(false)
    setLineas([])
    setForm({ cliente_id: '', forma_pago: 'contado', notas: '', producto_id: '', cantidad: '1' })
    setSaving(false)
    cargar()
  }

  const abrirModal = () => {
    setLineas([])
    setForm({ cliente_id: '', forma_pago: 'contado', notas: '', producto_id: '', cantidad: '1' })
    setShowModal(true)
  }

  return (
    <div className="p-8">
      {showModal && (
        <Modal title="Nuevo pedido" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cliente *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.cliente_id}
                  onChange={e => setForm({ ...form, cliente_id: e.target.value })}
                >
                  <option value="">— Seleccionar —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Forma de pago</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.forma_pago}
                  onChange={e => setForm({ ...form, forma_pago: e.target.value })}
                >
                  {FORMAS_PAGO.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-3 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Agregar productos</p>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.producto_id}
                  onChange={e => setForm({ ...form, producto_id: e.target.value })}
                >
                  <option value="">— Producto —</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (stock: {p.stock_total}) — Q{p.precio_venta.toFixed(2)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm text-center"
                  value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  placeholder="Cant."
                />
                <button
                  onClick={agregarLinea}
                  disabled={!form.producto_id}
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40"
                  style={{ backgroundColor: '#1E50A2' }}
                >
                  +
                </button>
              </div>

              {lineas.length > 0 && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left py-1">Producto</th>
                      <th className="text-right py-1">Cant.</th>
                      <th className="text-right py-1">Precio</th>
                      <th className="text-right py-1">Subtotal</th>
                      <th className="py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.map((l, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-1.5 text-gray-700 truncate max-w-[120px]">{l.nombre}</td>
                        <td className="py-1.5 text-right text-gray-600">{l.cantidad}</td>
                        <td className="py-1.5 text-right text-gray-600">Q{l.precio_unitario.toFixed(2)}</td>
                        <td className="py-1.5 text-right font-medium text-gray-900">
                          Q{(l.cantidad * l.precio_unitario).toFixed(2)}
                        </td>
                        <td className="py-1.5 text-right">
                          <button onClick={() => quitarLinea(i)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notas</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.notas}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                placeholder="Instrucciones de entrega, etc."
              />
            </div>

            {lineas.length > 0 && (
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Total del pedido</span>
                <span className="text-lg font-bold" style={{ color: '#1E50A2' }}>
                  Q{totalPedido.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={saving || !form.cliente_id || lineas.length === 0}
                className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#1E50A2' }}
              >
                {saving ? 'Guardando...' : 'Crear pedido'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pedidos.length} pedidos en total</p>
        </div>
        <button
          onClick={abrirModal}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#1E50A2' }}
        >
          + Nuevo pedido
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Sin pedidos todavía</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Número</th>
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Vendedor</th>
                <th className="text-left px-6 py-3">Estado</th>
                <th className="text-left px-6 py-3">Pago</th>
                <th className="text-right px-6 py-3">Total</th>
                <th className="text-left px-6 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">{p.numero}</td>
                  <td className="px-6 py-4 text-gray-700">{p.clientes?.nombre ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.usuarios ? `${p.usuarios.nombre} ${p.usuarios.apellido}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLOR[p.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{p.forma_pago.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    Q{p.total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(p.fecha_pedido).toLocaleDateString('es-GT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
