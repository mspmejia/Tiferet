import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ProductoConStock } from '@tiferet/types'

interface InventarioState {
  productos: ProductoConStock[]
  loading: boolean
  error: string | null
  buscar: (query: string) => void
  filtroAlerta: string | null
  setFiltroAlerta: (alerta: string | null) => void
  refetch: () => void
}

export function useInventario(): InventarioState {
  const [productos, setProductos] = useState<ProductoConStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filtroAlerta, setFiltroAlerta] = useState<string | null>(null)

  const fetchInventario = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let q = supabase
        .from('v_stock_productos')
        .select('*')
        .order('nombre')

      if (query.length > 1) {
        q = q.ilike('nombre', `%${query}%`)
      }

      if (filtroAlerta) {
        q = q.eq('alerta', filtroAlerta)
      }

      const { data, error: err } = await q
      if (err) throw err
      setProductos((data ?? []) as ProductoConStock[])
    } catch {
      setError('Error cargando inventario')
    } finally {
      setLoading(false)
    }
  }, [query, filtroAlerta])

  useEffect(() => {
    const timer = setTimeout(fetchInventario, 300)
    return () => clearTimeout(timer)
  }, [fetchInventario])

  return {
    productos,
    loading,
    error,
    buscar: setQuery,
    filtroAlerta,
    setFiltroAlerta,
    refetch: fetchInventario,
  }
}
