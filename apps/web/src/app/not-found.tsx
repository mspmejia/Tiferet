import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold" style={{ color: '#1E50A2' }}>404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">Página no encontrada</h1>
        <p className="mt-2 text-sm text-gray-500">La página que buscás no existe.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block px-5 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#1E50A2' }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
