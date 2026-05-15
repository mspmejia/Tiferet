'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/Modal'

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

const TIPOS = ['farmacia', 'clinica', 'distribuidor', 'hospital']

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', nit: '', direccion: '', zona: '', telefono: '', tipo: 'farmacia', limite_credito: '0', dias_credito: '30' })

  const supabase = createClient()

  const cargar = async () => {
    const { data } = await supabase.from('clientes').select('*').eq('activo', true).order('nombre')
    setClientes((data as Cliente[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.zona.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleGuardar = async () => {
    if (!form.nombre || !form.direccion || !form.zona) return
    setSaving(true)
    await supabase.from('clientes').insert({
      nombre: form.nombre,
      nit: form.nit || null,
      direccion: form.direccion,
      zona: form.zona,
      telefono: form.telefono || null,
      tipo: form.tipo,
      limite_credito: parseFloat(form.limite_credito) || 0,
      dias_credito: parseInt(form.dias_credito) || 30,
    })
    setShowModal(false)
    setForm({ nombre: '', nit: '', direccion: '', zona: '', telefono: '', tipo: 'farmacia', limite_credito: '0', dias_credito: '30' })
    setSaving(false)
    cargar()
  }

  return (
    <div className="p-8">
      {showModal && (
        <Modal title="Nuevo cliente" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Farmacia San Juan" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">NIT</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} placeholder="1234567-8" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo *</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dirección *</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="6a Avenida 12-34, Zona 1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Zona *</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })} placeholder="Zona 1" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="2233-4455" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Límite de crédito (Q)</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" value={form.limite_credito} onChange={e => setForm({ ...form, limite_credito: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Días de crédito</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" value={form.dias_credito} onChange={e => setForm({ ...form, dias_credito: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">Cancelar</button>
              <button onClick={handleGuardar} disabled={saving} className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60" style={{ backgroundColor: '#1E50A2' }}>
                {saving ? 'Guardando...' : 'Guardar cliente'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clientes.length} clientes activos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: '#1E50A2' }}>
          + Nuevo cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input type="text" placeholder="Buscar por nombre o zona..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
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
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{c.nit ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-700">{c.zona}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">{c.tipo}</span></td>
                  <td className="px-6 py-4 text-gray-500">{c.telefono ?? '—'}</td>
                  <td className="px-6 py-4 text-right text-gray-700">Q{c.limite_credito.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
