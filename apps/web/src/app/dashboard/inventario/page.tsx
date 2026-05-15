'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/Modal'

type Producto = {
  id: string
  codigo: string
  nombre: string
  unidad: string
  precio_venta: number
  stock_minimo: number
  stock_total: number
  proximo_vencimiento: string | null
  alerta: 'ok' | 'bajo' | 'critico' | 'sin_stock'
}

type Proveedor = { id: string; nombre: string }

const ALERTA_STYLE: Record<string, string> = {
  ok: 'bg-green-100 text-green-700',
  bajo: 'bg-yellow-100 text-yellow-700',
  critico: 'bg-orange-100 text-orange-700',
  sin_stock: 'bg-red-100 text-red-600',
}

const UNIDADES = ['unidad', 'caja', 'blister', 'frasco', 'ampolla', 'sobre', 'tubo']

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroAlerta, setFiltroAlerta] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    unidad: 'unidad',
    precio_costo: '0',
    precio_venta: '0',
    stock_minimo: '5',
    stock_inicial: '0',
    proveedor_id: '',
    numero_lote: '',
    fecha_vencimiento: '',
  })

  const supabase = createClient()

  const cargar = async () => {
    const [{ data: prods }, { data: provs }] = await Promise.all([
      supabase.from('v_stock_productos').select('*').order('nombre'),
      supabase.from('proveedores').select('id, nombre').eq('activo', true).order('nombre'),
    ])
    setProductos((prods as Producto[]) ?? [])
    setProveedores((provs as Proveedor[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = productos.filter(p => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideAlerta = filtroAlerta === 'todos' || p.alerta === filtroAlerta
    return coincideBusqueda && coincideAlerta
  })

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre) return
    setSaving(true)
    // Insertar producto
    const { data: prod } = await supabase.from('productos').insert({
      codigo: form.codigo,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      unidad: form.unidad,
      precio_costo: parseFloat(form.precio_costo) || 0,
      precio_venta: parseFloat(form.precio_venta) || 0,
      stock_minimo: parseInt(form.stock_minimo) || 5,
      proveedor_id: form.proveedor_id || null,
    }).select().single()

    // Insertar lote inicial si hay stock
    if (prod && parseInt(form.stock_inicial) > 0) {
      await supabase.from('lotes_inventario').insert({
        producto_id: prod.id,
        cantidad: parseInt(form.stock_inicial),
        numero_lote: form.numero_lote || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        proveedor_id: form.proveedor_id || null,
      })
    }

    setShowModal(false)
    setForm({
      codigo: '', nombre: '', descripcion: '', unidad: 'unidad',
      precio_costo: '0', precio_venta: '0', stock_minimo: '5',
      stock_inicial: '0', proveedor_id: '', numero_lote: '', fecha_vencimiento: '',
    })
    setSaving(false)
    cargar()
  }

  return (
    <div className="p-8">
      {showModal && (
        <Modal title="Nuevo producto" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Código *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono"
                  value={form.codigo}
                  onChange={e => setForm({ ...form, codigo: e.target.value })}
                  placeholder="MED-001"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Unidad</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.unidad}
                  onChange={e => setForm({ ...form, unidad: e.target.value })}
                >
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Amoxicilina 500mg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Antibiótico de amplio espectro"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Precio costo (Q)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.precio_costo}
                  onChange={e => setForm({ ...form, precio_costo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Precio venta (Q)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.precio_venta}
                  onChange={e => setForm({ ...form, precio_venta: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Stock mínimo</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.stock_minimo}
                  onChange={e => setForm({ ...form, stock_minimo: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Proveedor</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.proveedor_id}
                onChange={e => setForm({ ...form, proveedor_id: e.target.value })}
              >
                <option value="">— Sin proveedor —</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Lote inicial</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    value={form.stock_inicial}
                    onChange={e => setForm({ ...form, stock_inicial: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">N° lote</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono"
                    value={form.numero_lote}
                    onChange={e => setForm({ ...form, numero_lote: e.target.value })}
                    placeholder="L2024-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Vencimiento</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    value={form.fecha_vencimiento}
                    onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={saving || !form.codigo || !form.nombre}
                className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#1E50A2' }}
              >
                {saving ? 'Guardando...' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500 mt-0.5">{productos.length} productos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#1E50A2' }}
        >
          + Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
          />
          <select
            value={filtroAlerta}
            onChange={e => setFiltroAlerta(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
          >
            <option value="todos">Todos</option>
            <option value="sin_stock">Sin stock</option>
            <option value="critico">Crítico</option>
            <option value="bajo">Bajo</option>
            <option value="ok">OK</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Sin productos todavía</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Código</th>
                <th className="text-left px-6 py-3">Producto</th>
                <th className="text-left px-6 py-3">Unidad</th>
                <th className="text-right px-6 py-3">Stock</th>
                <th className="text-right px-6 py-3">Mínimo</th>
                <th className="text-left px-6 py-3">Alerta</th>
                <th className="text-left px-6 py-3">Próx. vence</th>
                <th className="text-right px-6 py-3">Precio venta</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500 text-xs">{p.codigo}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{p.unidad}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{p.stock_total}</td>
                  <td className="px-6 py-4 text-right text-gray-400">{p.stock_minimo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ALERTA_STYLE[p.alerta]}`}>
                      {p.alerta.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {p.proximo_vencimiento
                      ? new Date(p.proximo_vencimiento).toLocaleDateString('es-GT')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    Q{p.precio_venta.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
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
