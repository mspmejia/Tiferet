'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/Modal'

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

type Cliente = { id: string; nombre: string }
type Producto = { id: string; nombre: string; codigo: string; precio_venta: number; stock_total: number }

type LineaPedido = {
  producto_id: string
  nombre: string
  cantidad: number
  precio_unitario: number
  descuento: number
}

const ESTADO_COLOR: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  confirmado: 'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-yellow-100 text-yellow-700',
  despachado: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
}

const FORMAS_PAGO = ['contado', 'credito', 'cheque', 'transferencia']

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lineas, setLineas] = useState<LineaPedido[]>([])
  const [form, setForm] = useState({
    cliente_id: '',
    forma_pago: 'contado',
    notas: '',
    producto_id: '',
    cantidad: '1',
  })

  const supabase = createClient()

  const cargar = async () => {
    const [{ data: peds }, { data: cls }, { data: prods }] = await Promise.all([
      supabase.from('pedidos').select('*, clientes(nombre), usuarios(nombre, apellido)').order('fecha_pedido', { ascending: false }),
      supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
      supabase.from('v_stock_productos').select('id, nombre, codigo, precio_venta, stock_total').order('nombre'),
    ])
    setPedidos((peds as Pedido[]) ?? [])
    setClientes((cls as Cliente[]) ?? [])
    setProductos((prods as Producto[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = pedidos.filter(p =>
    p.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.clientes?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPedido = lineas.reduce((sum, l) => sum + (l.cantidad * l.precio_unitario * (1 - l.descuento / 100)), 0)

  const agregarLinea = () => {
    const prod = productos.find(p => p.id === form.producto_id)
    if (!prod || parseInt(form.cantidad) <= 0) return
    const existente = lineas.findIndex(l => l.producto_id === prod.id)
    if (existente >= 0) {
      const updated = [...lineas]
      updated[existente].cantidad += parseInt(form.cantidad)
      setLineas(updated)
    } else {
      setLineas([...lineas, {
        producto_id: prod.id,
        nombre: prod.nombre,
        cantidad: parseInt(form.cantidad),
        precio_unitario: prod.precio_venta,
        descuento: 0,
      }])
    }
    setForm({ ...form, producto_id: '', cantidad: '1' })
  }

  const quitarLinea = (idx: number) => {
    setLineas(lineas.filter((_, i) => i !== idx))
  }

  const handleGuardar = async () => {
    if (!form.cliente_id || lineas.length === 0) return
    setSaving(true)

    const numero = `PED-${Date.now().toString().slice(-6)}`
    const { data: pedido } = await supabase.from('pedidos').insert({
      numero,
      cliente_id: form.cliente_id,
      forma_pago: form.forma_pago,
      notas: form.notas || null,
      estado: 'confirmado',
      total: totalPedido,
    }).select().single()

    if (pedido) {
      await supabase.from('pedido_items').insert(
        lineas.map(l => ({
          pedido_id: pedido.id,
          producto_id: l.producto_id,
          cantidad: l.cantidad,
          precio_unitario: l.precio_unitario,
          descuento: l.descuento,
          subtotal: l.cantidad * l.precio_unitario * (1 - l.descuento / 100),
        }))
      )
    }

    setShowModal(false)
    setLineas([])
    setForm({ cliente_id: '', forma_pago: 'contado', notas: '', producto_id: '', cantidad: '1' })
    setSaving(false)
    cargar()
  }

  const abrirModal = () => {
    setLineas([])
    setForm({ cliente_id: '', forma_pago: 'contado', notas: '', producto_id: '', cantidad: '1' })
    setShowModal(true)
  }

  return (
    <div className="p-8">
      {showModal && (
        <Modal tit