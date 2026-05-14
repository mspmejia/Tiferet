'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Entrega = {
  id: string
  estado: string
  fecha_programada: string
  fecha_entrega: string | null
  observaciones: string | null
  pedidos: { numero: string; clientes: { nombre: string } | null } | null
  usuarios: { nombre: string; apellido: string } | null
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  en_ruta: 'bg-blue-100 text-blue-700',
  entregado: 'bg-green-100 text-green-700',
  no_entregado: 'bg-red-100 text-red-600',
  reprogramado: 'bg-gray-100 text-gray-600',
}

export default function EntregasPage() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('entregas')
      .select('*, pedidos(numero, clientes(nombre)), usuarios(nombre, apellido)')
      .order('fecha_programada', { ascending: false })
      .then(({ data }) => {
        setEntregas((data as Entrega[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{entregas.length} entregas registradas</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : entregas.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Sin entregas registradas</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Pedido</th>
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Repartidor</th>
                <th className="text-left px-6 py-3">Estado</th>
                <th className="text-left px-6 py-3">Programada</th>
                <th className="text-left px-6 py-3">Entregada</th>
              </tr>
            </thead>
            <tbody>
              {entregas.map(e => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-700">{e.pedidos?.numero ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-900">{e.pedidos?.clientes?.nombre ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {e.usuarios ? `${e.usuarios.nombre} ${e.usuarios.apellido}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ESTADO_COLOR[e.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {e.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(e.fecha_programada).toLocaleDateString('es-GT')}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {e.fecha_entrega
                      ? new Date(e.fecha_entrega).toLocaleDateString('es-GT')
                      : '—'}
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
