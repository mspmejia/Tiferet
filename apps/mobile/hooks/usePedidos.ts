import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Cliente, Pedido, LineaPedido } from '@tiferet/types'

interface LineaForm {
  productoId: string
  nombreProducto: string
  cantidad: number
  precioUnitario: number
}

interface NuevoPedidoForm {
  cliente: Cliente | null
  lineas: LineaForm[]
  formaPago: 'contado' | 'credito_30' | 'credito_60' | 'transferencia'
  fechaEntrega: string
  observaciones: string
}

interface UsePedidosReturn {
  form: NuevoPedidoForm
  setCliente: (c: Cliente | null) => void
  agregarLinea: (linea: LineaForm) => void
  actualizarCantidad: (index: number, cantidad: number) => void
  removerLinea: (index: number) => void
  setFormaPago: (fp: NuevoPedidoForm['formaPago']) => void
  setObservaciones: (obs: string) => void
  total: number
  crearPedido: (vendedorId: string) => Promise<{ success: boolean; error?: string; pedido?: Pedido }>
  resetForm: () => void
  guardando: boolean
}

const formInicial: NuevoPedidoForm = {
  cliente: null,
  lineas: [],
  formaPago: 'contado',
  fechaEntrega: new Date().toISOString().split('T')[0],
  observaciones: '',
}

export function usePedidos(): UsePedidosReturn {
  const [form, setForm] = useState<NuevoPedidoForm>(formInicial)
  const [guardando, setGuardando] = useState(false)

  const total = form.lineas.reduce(
    (acc, l) => acc + l.cantidad * l.precioUnitario, 0
  )

  function setCliente(c: Cliente | null) {
    setForm(prev => ({ ...prev, cliente: c }))
  }

  function agregarLinea(linea: LineaForm) {
    setForm(prev => {
      const existe = prev.lineas.findIndex(l => l.productoId === linea.productoId)
      if (existe >= 0) {
        const lineas = [...prev.lineas]
        lineas[existe].cantidad += linea.cantidad
        return { ...prev, lineas }
      }
      return { ...prev, lineas: [...prev.lineas, linea] }
    })
  }

  function actualizarCantidad(index: number, cantidad: number) {
    setForm(prev => {
      const lineas = [...prev.lineas]
      if (cantidad <= 0) {
        lineas.splice(index, 1)
      } else {
        lineas[index] = { ...lineas[index], cantidad }
      }
      return { ...prev, lineas }
    })
  }

  function removerLinea(index: number) {
    setForm(prev => {
      const lineas = [...prev.lineas]
      lineas.splice(index, 1)
      return { ...prev, lineas }
    })
  }

  function setFormaPago(fp: NuevoPedidoForm['formaPago']) {
    setForm(prev => ({ ...prev, formaPago: fp }))
  }

  function setObservaciones(obs: string) {
    setForm(prev => ({ ...prev, observaciones: obs }))
  }

  async function crearPedido(vendedorId: string) {
    if (!form.cliente || form.lineas.length === 0) {
      return { success: false, error: 'Faltan cliente o productos' }
    }

    setGuardando(true)
    try {
      // Insertar pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: form.cliente.id,
          vendedor_id: vendedorId,
          forma_pago: form.formaPago,
          fecha_entrega_estimada: form.fechaEntrega,
          observaciones: form.observaciones,
          estado: 'confirmado',
          subtotal: total,
          descuento_total: 0,
          total,
        })
        .select()
        .single()

      if (pedidoError) throw pedidoError

      // Insertar líneas
      const lineas = form.lineas.map(l => ({
        pedido_id: pedido.id,
        producto_id: l.productoId,
        cantidad: l.cantidad,
        precio_unitario: l.precioUnitario,
        descuento: 0,
      }))

      const { error: lineasError } = await supabase
        .from('lineas_pedido')
        .insert(lineas)

      if (lineasError) throw lineasError

      return { success: true, pedido }
    } catch (e: any) {
      return { success: false, error: e.message ?? 'Error creando pedido' }
    } finally {
      setGuardando(false)
    }
  }

  function resetForm() {
    setForm(formInicial)
  }

  return {
    form,
    setCliente,
    agregarLinea,
    actualizarCantidad,
    removerLinea,
    setFormaPago,
    setObservaciones,
    total,
    crearPedido,
    resetForm,
    guardando,
  }
}
