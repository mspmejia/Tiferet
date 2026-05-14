'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

const ESTADO_COLOR: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  confirmado: 'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-yellow-100 text-yellow-700',
  despachado: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('pedidos')
      .select('*, clientes(nombre), usuarios(nombre, apellido)')
      .order('fecha_pedido', { ascending: false })
      .then(({ data }) => {
        setPedidos((data as Pedido[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtrados = pedidos.filter(p =>
    p.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.clientes?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pedidos.length} pedidos en total</p>
        </div>
        <button
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
            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
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
