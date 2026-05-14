'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type SaldoCliente = {
  id: string
  nombre: string
  zona: string
  total_facturado: number
  total_cobrado: number
  saldo_pendiente: number
}

export default function ReportesPage() {
  const [saldos, setSaldos] = useState<SaldoCliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('v_saldos_clientes')
      .select('*')
      .order('saldo_pendiente', { ascending: false })
      .then(({ data }) => {
        setSaldos((data as SaldoCliente[]) ?? [])
        setLoading(false)
      })
  }, [])

  const totalPendiente = saldos.reduce((s, c) => s + Number(c.saldo_pendiente), 0)
  const totalFacturado = saldos.reduce((s, c) => s + Number(c.total_facturado), 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen de cuentas por cobrar</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total facturado</p>
          <p className="text-2xl font-bold text-gray-900">
            Q{totalFacturado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Por cobrar</p>
          <p className="text-2xl font-bold" style={{ color: '#F97316' }}>
            Q{totalPendiente.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Clientes con saldo</p>
          <p className="text-2xl font-bold" style={{ color: '#1E50A2' }}>
            {saldos.filter(c => c.saldo_pendiente > 0).length}
          </p>
        </div>
      </div>

      {/* Tabla de saldos */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Cuentas por cobrar por cliente</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : saldos.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Sin datos todavía</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Zona</th>
                <th className="text-right px-6 py-3">Facturado</th>
                <th className="text-right px-6 py-3">Cobrado</th>
                <th className="text-right px-6 py-3">Saldo pendiente</th>
              </tr>
            </thead>
            <tbody>
              {saldos.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{c.zona}</td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    Q{Number(c.total_facturado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    Q{Number(c.total_cobrado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold"
                      style={{ color: c.saldo_pendiente > 0 ? '#F97316' : '#16a34a' }}>
                    Q{Number(c.saldo_pendiente).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
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
