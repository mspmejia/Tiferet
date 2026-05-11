import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  pedidosHoy: number
  cobrosPendientes: number
  entregasOk: number
  entregasPendientes: number
}

interface ActividadItem {
  id: string
  tipo: 'cobro_pendiente' | 'entrega_ok' | 'pedido_creado'
  titulo: string
  detalle: string
  hora: string
}

interface DashboardData {
  stats: DashboardStats
  actividad: ActividadItem[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboard(vendedorId?: string): DashboardData {
  const [stats, setStats] = useState<DashboardStats>({
    pedidosHoy: 0,
    cobrosPendientes: 0,
    entregasOk: 0,
    entregasPendientes: 0,
  })
  const [actividad, setActividad] = useState<ActividadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!vendedorId) return
    setLoading(true)
    setError(null)

    try {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      // Pedidos creados hoy por este vendedor
      const { count: pedidosHoy } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('vendedor_id', vendedorId)
        .gte('created_at', hoy.toISOString())

      // Pedidos con saldo pendiente de cobro
      const { count: cobrosPendientes } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('vendedor_id', vendedorId)
        .in('forma_pago', ['credito_30', 'credito_60'])
        .not('estado', 'in', '("cancelado","borrador")')

      // Entregas de hoy completadas
      const { count: entregasOk } = await supabase
        .from('entregas')
        .select('*', { count: 'exact', head: true })
        .eq('repartidor_id', vendedorId)
        .eq('estado', 'entregado')
        .gte('fecha_entrega', hoy.toISOString())

      // Entregas pendientes
      const { count: entregasPendientes } = await supabase
        .from('entregas')
        .select('*', { count: 'exact', head: true })
        .eq('repartidor_id', vendedorId)
        .in('estado', ['pendiente', 'en_ruta'])

      setStats({
        pedidosHoy: pedidosHoy ?? 0,
        cobrosPendientes: cobrosPendientes ?? 0,
        entregasOk: entregasOk ?? 0,
        entregasPendientes: entregasPendientes ?? 0,
      })

      // Actividad reciente (últimos 10 pedidos)
      const { data: pedidosRecientes } = await supabase
        .from('pedidos')
        .select('id, numero, total, estado, created_at, clientes(nombre)')
        .eq('vendedor_id', vendedorId)
        .order('created_at', { ascending: false })
        .limit(5)

      const items: ActividadItem[] = (pedidosRecientes ?? []).map((p: any) => ({
        id: p.id,
        tipo: p.estado === 'entregado' ? 'entrega_ok' :
              p.forma_pago?.includes('credito') ? 'cobro_pendiente' : 'pedido_creado',
        titulo: p.clientes?.nombre ?? 'Cliente',
        detalle: `Q${Number(p.total).toFixed(2)} · ${p.numero}`,
        hora: new Date(p.created_at).toLocaleTimeString('es-GT', {
          hour: '2-digit', minute: '2-digit'
        }),
      }))

      setActividad(items)
    } catch (e) {
      setError('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [vendedorId])

  return { stats, actividad, loading, error, refetch: fetchData }
}
