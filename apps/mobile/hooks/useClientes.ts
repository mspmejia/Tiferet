import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Cliente } from '@tiferet/types'

interface ClientesState {
  clientes: Cliente[]
  loading: boolean
  error: string | null
  buscar: (query: string) => void
  filtrarPorDeuda: (soloConDeuda: boolean) => void
  refetch: () => void
}

export function useClientes(vendedorId?: string): ClientesState {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [soloDeuda, setSoloDeuda] = useState(false)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let q = supabase
        .from('v_saldos_clientes')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (query.length > 1) {
        q = q.ilike('nombre', `%${query}%`)
      }

      if (soloDeuda) {
        q = q.gt('saldo_pendiente', 0)
      }

      const { data, error: err } = await q
      if (err) throw err
      setClientes(data ?? [])
    } catch {
      setError('Error cargando clientes')
    } finally {
      setLoading(false)
    }
  }, [query, soloDeuda, vendedorId])

  useEffect(() => {
    const timer = setTimeout(fetchClientes, 300)
    return () => clearTimeout(timer)
  }, [fetchClientes])

  return {
    clientes,
    loading,
    error,
    buscar: setQuery,
    filtrarPorDeuda: setSoloDeuda,
    refetch: fetchClientes,
  }
}
