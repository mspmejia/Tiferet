import { createClient } from '@/lib/supabase/server'

async function getStats(supabase: any) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const [pedidos, clientes, stockBajo, entregasPend] = await Promise.all([
    supabase.from('pedidos').select('*', { count: 'exact', head: true })
      .gte('created_at', hoy.toISOString()),
    supabase.from('clientes').select('*', { count: 'exact', head: true })
      .eq('activo', true),
    supabase.from('v_stock_productos').select('*', { count: 'exact', head: true })
      .in('alerta', ['bajo', 'critico', 'sin_stock']),
    supabase.from('entregas').select('*', { count: 'exact', head: true })
      .in('estado', ['pendiente', 'en_ruta']),
  ])

  return {
    pedidosHoy: pedidos.count ?? 0,
    clientesActivos: clientes.count ?? 0,
    stockBajo: stockBajo.count ?? 0,
    entregasPendientes: entregasPend.count ?? 0,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const stats = await getStats(supabase)

  const { data: pedidosRecientes } = await supabase
    .from('pedidos')
    .select('id, numero, total, estado, created_at, clientes(nombre)')
    .order('created_at', { ascending: false })
    .limit(8)

  const estadoColor: Record<string, string> = {
    borrador:       'bg-gray-100 text-gray-600',
    confirmado:     'bg-blue-50 text-blue-700',
    en_preparacion: 'bg-yellow-50 text-yellow-700',
    despachado:     'bg-orange-50 text-orange-700',
    entregado:      'bg-green-50 text-green-700',
    cancelado:      'bg-red-50 text-red-700',
  }

  const STATS = [
    { label: 'Pedidos hoy',          value: stats.pedidosHoy,          color: '#1E50A2' },
    { label: 'Clientes activos',      value: stats.clientesActivos,     color: '#16A34A' },
    { label: 'Productos stock bajo',  value: stats.stockBajo,           color: '#D97706' },
    { label: 'Entregas pendientes',   value: stats.entregasPendientes,  color: '#F97316' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Panel general</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-3xl font-semibold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Pedidos recientes</h2>
          <a href="/dashboard/pedidos" className="text-xs font-medium" style={{ color: '#1E50A2' }}>
            Ver todos →
          </a>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Número</th>
              <th className="px-5 py-3 text-left font-medium">Cliente</th>
              <th className="px-5 py-3 text-left font-medium">Total</th>
              <th className="px-5 py-3 text-left font-medium">Estado</th>
              <th className="px-5 py-3 text-left font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(pedidosRecientes ?? []).map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-5 py-3.5 font-medium text-gray-900">{p.numero}</td>
                <td className="px-5 py-3.5 text-gray-600">{p.clientes?.nombre ?? '—'}</td>
                <td className="px-5 py-3.5 font-medium" style={{ color: '#1E50A2' }}>
                  Q{Number(p.total).toFixed(2)}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${estadoColor[p.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {p.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">
                  {new Date(p.created_at).toLocaleDateString('es-GT')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!pedidosRecientes || pedidosRecientes.length === 0) && (
          <p className="text-center py-8 text-sm text-gray-400">Sin pedidos todavía</p>
        )}
      </div>
    </div>
  )
}
