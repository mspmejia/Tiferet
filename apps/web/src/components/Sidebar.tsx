'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Usuario } from '@tiferet/types'

const NAV = [
  { href: '/dashboard',              label: 'Inicio',       icon: '⊞' },
  { href: '/dashboard/pedidos',      label: 'Pedidos',      icon: '+' },
  { href: '/dashboard/clientes',     label: 'Clientes',     icon: '●' },
  { href: '/dashboard/proveedores',  label: 'Proveedores',  icon: '◈' },
  { href: '/dashboard/inventario',   label: 'Inventario',   icon: '#' },
  { href: '/dashboard/entregas',     label: 'Entregas',     icon: '→' },
  { href: '/dashboard/cobros',       label: 'Cobros',       icon: '$' },
  { href: '/dashboard/reportes',     label: 'Reportes',     icon: '≡' },
]

interface SidebarProps {
  perfil: Usuario | null
}

export function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const iniciales = perfil
    ? (perfil.nombre[0] + perfil.apellido[0]).toUpperCase()
    : '?'

  return (
    <aside className="w-56 flex flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ backgroundColor: '#F97316' }}>
          <span className="text-base font-bold text-white">T</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">Tiferet</p>
          <p className="text-xs text-gray-400">Salud ERP</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'font-medium text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={active ? { backgroundColor: '#1E50A2' } : {}}
            >
              <span className="text-base w-5 text-center leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer"
             onClick={handleSignOut}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
               style={{ backgroundColor: '#1E50A2' }}>
            {iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {perfil ? `${perfil.nombre} ${perfil.apellido}` : 'Usuario'}
            </p>
            <p className="text-xs text-gray-400 capitalize">{perfil?.rol ?? ''}</p>
          </div>
          <span cla