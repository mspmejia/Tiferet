'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Cliente = {
  id: string
  nombre: string
  nit: string | null
  zona: string
  tipo: string
  telefono: string | null
  limite_credito: number
  activo: boolean
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('nombre')
      .then(({ data }) => {
        setClientes((data as Cliente[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.zona.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clientes.length} clientes activos</p>
        </div>
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#1E50A2' }}
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar por nombre o zona..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Sin clientes todavía</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Nombre</th>
                <th className="text-left px-6 py-3">NIT</th>
                <th className="text-left px-6 py-3">Zona</th>
                <th className="text-left px-6 py-3">Tipo</th>
                <th className="text-left px-6 py-3">Teléfono</th>
                <th className="text-right px-6 py-3">Límite crédito</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{c.nit ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-700">{c.zona}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{c.telefono ?? '—'}</td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    Q{c.limite_credito.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
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
