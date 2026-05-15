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
                  setForm({ ...form, pedido_id: e.target.value, monto: ped ? ped.total.toFixed(2) : form.monto })
                }}
                disabled={!form.cliente_id}
              >
                <option value="">— Sin pedido específico —</option>
                {pedidosCliente.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.numero} — Q{p.total.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monto (Q) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.monto}
                  onChange={e => setForm({ ...form, monto: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Método de pago</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.metodo}
                  onChange={e => setForm({ ...form, metodo: e.target.value })}
                >
                  {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Referencia / N° cheque</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.referencia}
                onChange={e => setForm({ ...form, referencia: e.target.value })}
                placeholder="TRF-123456"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.observaciones}
                onChange={e => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Notas adicionales..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={saving || !form.cliente_id || !form.monto}
                className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#1E50A2' }}
              >
                {saving ? 'Guardando...' : 'Registrar cobro'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cobros</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cobros.length} cobros registrados</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total cobrado</p>
            <p className="text-2xl font-bold" style={{ color: '#1E50A2' }}>
              Q{total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: '#1E50A2' }}
          >
            + Registrar cobro
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : cobros.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Sin cobros registrados</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Pedido</th>
                <th className="text-left px-6 py-3">Cobrador</th>
                <th className="text-left px-6 py-3">Método</th>
                <th className="text-left px-6 py-3">Referencia</th>
                <th className="text-right px-6 py-3">Monto</th>
                <th className="text-left px-6 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {cobros.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.clientes?.nombre ?? '—'}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{c.pedidos?.numero ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {c.usuarios ? `${c.usuarios.nombre} ${c.usuarios.apellido}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 capitalize">
                      {c.metodo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{c.referencia ?? '—'}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    Q{c.monto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(c.fecha).toLocaleDateString('es-GT')}
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
