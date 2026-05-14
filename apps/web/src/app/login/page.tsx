'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setError('Error de configuración: variables de entorno no disponibles')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(`Error: ${error.message}`)
        setLoading(false)
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(`Error inesperado: ${err?.message ?? 'desconocido'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#1E50A2' }}>
      {/* Panel izquierdo — marca */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-12">
        <div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
               style={{ backgroundColor: '#F97316' }}>
            <span className="text-3xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-semibold text-white leading-tight">
            Tiferet Salud
          </h1>
          <p className="text-blue-200 mt-2 text-sm">
            ERP · Distribución farmacéutica
          </p>
        </div>
        <div className="space-y-4">
          {['Inventario en tiempo real', 'Pedidos desde celular', 'Control de crédito y cobros', 'Documentos y entregas'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                   style={{ backgroundColor: '#F97316', color: 'white' }}>✓</div>
              <span className="text-blue-100 text-sm">{f}</span>
            </div>
          ))}
        </div>
        <p className="text-blue-300 text-xs">© 2025 Tiferet Salud · v1.0</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: '#F97316' }}>
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <span className="font-semibold text-gray-900">Tiferet Salud</span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Iniciar sesión</h2>
          <p className="text-gray-500 text-sm mb-8">Acceso al panel de administración</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
              />
            </div>

            {error && (
              <div className="rounded-xl p-3 text-sm text-red-700 bg-red-50 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60"
              style={{ backgroundColor: '#1E50A2' }}
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-gray-400">
            ¿Necesitás acceso?{' '}
            <a href="mailto:admin@tiferetsalud.com" className="text-blue-600 hover:underline">
              Contactá al administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
