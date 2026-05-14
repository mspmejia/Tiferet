'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Cobro = {
  id: string
  monto: number
  metodo: string
  referencia: string | null
  fecha: string
  observaciones: string | null
  clientes: { nombre: string } | null
  usuarios: { nombre: string; apellido: string } | null
  pedidos: { numero: string } | null
}

export default function CobrosPage() {
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('cobros')
      .select('*, clientes(nombre), usuarios(nombre, apellido), pedidos(numero)')
      .order('fecha', { ascending: false })
      .then(({ data }) => {
        const cobros = (data as Cobro[]) ?? []
        setCobros(cobros)
        setTotal(cobros.reduce((sum, c) => sum + c.monto, 0))
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cobros</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cobros.length} cobros registrados</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total cobrado</p>
          <p className="text-2xl font-bold" style={{ color: '#1E50A2' }}>
            Q{total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : cobros.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Sin cobros registrados</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Pedido</th>
                <th className="text-left px-6 py-3">Vendedor</th>
                <th className="text-left px-6 py-3">Método</th>
                <th className="text-left px-6 py-3">Referencia</th>
                <th className="text-right px-6 py-3">Monto</th>
                <th className="text-left px-6 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {cobros.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.clientes?.nombre ?? '—'}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{c.pedidos?.numero ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {c.usuarios ? `${c.usuarios.nombre} ${c.usuarios.apellido}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 capitalize">
                      {c.metodo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{c.referencia ?? '—'}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    Q{c.monto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(c.fecha).toLocaleDateString('es-GT')}
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
