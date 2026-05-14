'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/Modal'

type Producto = {
  id: string
  codigo: string
  nombre: string
  unidad: string
  precio_venta: number
  stock_minimo: number
  stock_total: number
  proximo_vencimiento: string | null
  alerta: 'ok' | 'bajo' | 'critico' | 'sin_stock'
}

type Proveedor = { id: string; nombre: string }

const ALERTA_STYLE: Record<string, string> = {
  ok: 'bg-green-100 text-green-700',
  bajo: 'bg-yellow-100 text-yellow-700',
  critico: 'bg-orange-100 text-orange-700',
  sin_stock: 'bg-red-100 text-red-600',
}

const UNIDADES = ['unidad', 'caja', 'blister', 'frasco', 'ampolla', 'sobre', 'tubo']

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroAlerta, setFiltroAlerta] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    unidad: 'unidad',
    precio_costo: '0',
    precio_venta: '0',
    stock_minimo: '5',
    stock_inicial: '0',
    proveedor_id: '',
    numero_lote: '',
    fecha_vencimiento: '',
  })

  const supabase = createClient()

  const cargar = async () => {
    const [{ data: prods }, { data: provs }] = await Promise.all([
      supabase.from('v_stock_productos').select('*').order('nombre'),
      supabase.from('proveedores').select('id, nombre').eq('activo', true).order('nombre'),
    ])
    setProductos((prods as Producto[]) ?? [])
    setProveedores((provs as Proveedor[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = productos.filter(p => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideAlerta = filtroAlerta === 'todos' || p.alerta === filtroAlerta
    return coincideBusqueda && coincideAlerta
  })

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre) return
    setSaving(true)
    // Insertar producto
    const { data: prod } = await supabase.from('productos').insert({
      codigo: form.codigo,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      unidad: form.unidad,
      precio_costo: parseFloat(form.precio_costo) || 0,
      precio_venta: parseFloat(form.precio_venta) || 0,
      stock_minimo: parseInt(form.stock_minimo) || 5,
      proveedor_id: form.proveedor_id || null,
    }).select().single()

    // Insertar lote inicial si hay stock
    if (prod && parseInt(form.stock_inicial) > 0) {
      await supabase.from('lotes_inventario').insert({
        producto_id: prod.id,
        cantidad: parseInt(form.stock_inicial),
        numero_lote: form.numero_lote || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        proveedor_id: form.proveedor_id || null,
      })
    }

    setShowModal(false)
    setForm({
      codigo: '', nombre: '', descripcion: '', unidad: 'unidad',
      precio_costo: '0', precio_venta: '0', stock_minimo: '5',
      stock_inicial: '0', proveedor_id: '', numero_lote: '', fecha_vencimiento: '',
    })
    setSaving(false)
    cargar()
  }

  return (
    <div className="p-8">
      {showModal && (
        <Modal title="Nuevo producto" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Código *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono"
                  value={form.codigo}
                  onChange={e => setForm({ ...form, codigo: e.target.value })}
                  placeholder="MED-001"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Unidad</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  value={form.unidad}
                  onChange={e => setForm({ ...form, unidad: e.target.value })}
                >
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Amoxicilina 500mg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                value={form.desc