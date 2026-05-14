'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/Modal'

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

type Cliente = { id: string; nombre: string }
type Pedido = { id: string; numero: string; total: number; cliente_id: string }

const METODOS = ['efectivo', 'cheque', 'transferencia', 'tarjeta', 'deposito']

export default function CobrosPage() {
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    cliente_id: '',
    pedido_id: '',
    monto: '',
    metodo: 'efectivo',
    referencia: '',
    observaciones: '',
  })

  const supabase = createClient()

  const cargar = async () => {
    const [{ data: cobs }, { data: cls }, { data: peds }] = await Promise.all([
      supabase.from('cobros').select('*, clientes(nombre), usuarios(nombre, apellido), pedidos(numero)').order('fecha', { ascending: false }),
      supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
      supabase.from('pedidos').select('id, numero, total, cliente_id').in('estado', ['confirmado', 'en_preparacion', 'despachado', 'entregado']).order('fecha_pedido', { ascending: false }),
    ])
    const listaCobros = (cobs as Cobro[]) ?? []
    setCobros(listaCobros)
    setTotal(listaCobros.reduce((sum, c) => sum + c.monto, 0))
    setClientes((cls as Cliente[]) ?? [])
    setPedidos((peds as Pedido[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  // Filtrar pedidos del cliente seleccionado
  const pedidosCliente = form.cliente_id
    ? pedidos.filter(p => p.cliente_id === form.cliente_id)
    : pedidos

  const handleGuardar = async () => {
    if (!form.cliente_id || !form.monto || parseFloat(form.monto) <= 0) return
    setSaving(true)
    await supabase.from('cobros').insert({
      cliente_id: form.cliente_id,
      pedido_id: form.pedido_id || null,
      monto: parseFloat(form.monto),
      metodo: form.metodo,
      referencia: form.referencia || null,
      observaciones: form.observaciones || null,
    })
    setShowModal(false)
    setForm({ cliente_id: '', pedido_id: '', monto: '', metodo: 'efectivo', referencia: '', observaciones: '' })
    setSaving(false)
    cargar()
  }

  return (
    <div className="p-8">
      {showModal && (
        <Modal title="Registrar cobro" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cliente *</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.cliente_id}
                onChange={e => setForm({ ...form, cliente_id: e.target.value, pedido_id: '' })}
              >
                <option value="">— Seleccionar cliente —</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Pedido (opcional)</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.pedido_id}
                onChange={e => {
                  const ped = pedidos.find(p => p.id === e.target.value)
      