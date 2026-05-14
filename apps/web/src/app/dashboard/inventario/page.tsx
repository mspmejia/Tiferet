'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

const ALERTA_STYLE: Record<string, string> = {
  ok: 'bg-green-100 text-green-700',
  bajo: 'bg-yellow-100 text-yellow-700',
  critico: 'bg-orange-100 text-orange-700',
  sin_stock: 'bg-red-100 text-red-600',
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroAlerta, setFiltroAlerta] = useState('todos')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('v_stock_productos')
      .select('*')
      .order('nombre')
      .then(({ data }) => {
        setProductos((data as Producto[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtrados = productos.filter(p => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideAlerta = filtroAlerta === 'todos' || p.alerta === filtroAlerta
    return coincideBusqueda && coincideAlerta
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500 mt-0.5">{productos.length} productos</p>
        </div>
        <button
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
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
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
