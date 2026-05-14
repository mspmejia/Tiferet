'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/Modal'

type Proveedor = {
  id: string
  nombre: string
  nit: string | null
  contacto: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  activo: boolean
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nombre: '', nit: '', contacto: '', telefono: '', email: '', direccion: '',
  })

  const supabase = createClient()

  const cargar = async () => {
    const { data } = await supabase
      .from('proveedores')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    setProveedores((data as Proveedor[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.contacto ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleGuardar = async () => {
    if (!form.nombre) return
    setSaving(true)
    await supabase.from('proveedores').insert({
      nombre: form.nombre,
      nit: form.nit || null,
      contacto: form.contacto || null,
      telefono: form.telefono || null,
      email: form.email || null,
      direccion: form.direccion || null,
    })
    setShowModal(false)
    setForm({ nombre: '', nit: '', contacto: '', telefono: '', email: '', direccion: '' })
    setSaving(false)
    cargar()
  }

  return (
    <div className="p-8">
      {showModal && (
        <Modal title="Nuevo proveedor" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Laboratorios XYZ"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">NIT</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.nit}
                  onChange={e => setForm({ ...form, nit: e.target.value })}
                  placeholder="1234567-8"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contacto</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.contacto}
                  onChange={e => setForm({ ...form, contacto: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  placeholder="2233-4455"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="ventas@laboratorio.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                placeholder="6a Avenida 12-34, Zona 9"
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
                disabled={saving || !form.nombre}
                className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#1E50A2' }}
              >
                {saving ? 'Guardando...' : 'Guardar proveedor'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{proveedores.length} proveedores activos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#1E50A2' }}
        >
          + Nuevo proveedor
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar por nombre o contacto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
          />
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Sin proveedores todavía</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Nombre</th>
                <th className="text-left px-6 py-3">NIT</th>
                <th className="text-left px-6 py-3">Contacto</th>
                <th className="text-left px-6 py-3">Teléfono</th>
                <th className="text-left px-6 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{p.nit ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-700">{p.contacto ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{p.telefono ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-400">{p.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
