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
                <input cla