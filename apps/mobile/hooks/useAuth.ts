import { useState, useEffect } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Usuario, UserRole } from '@tiferet/types'

interface AuthState {
  session: Session | null
  user: User | null
  perfil: Usuario | null
  rol: UserRole | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    perfil: null,
    rol: null,
    loading: true,
  })

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) cargarPerfil(session.user.id)
      else setState(prev => ({ ...prev, loading: false }))
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState(prev => ({ ...prev, session, user: session?.user ?? null }))
        if (session?.user) cargarPerfil(session.user.id)
        else setState(prev => ({ ...prev, perfil: null, rol: null, loading: false }))
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function cargarPerfil(userId: string) {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()

    setState(prev => ({
      ...prev,
      perfil: data,
      rol: data?.rol ?? null,
      loading: false,
    }))
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { ...state, signIn, signOut }
}
