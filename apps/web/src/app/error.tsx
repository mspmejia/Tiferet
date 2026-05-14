'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold" style={{ color: '#F97316' }}>500</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">Algo salió mal</h1>
        <p className="mt-2 text-sm text-gray-500">Ocurrió un error inesperado.</p>
        <button
          onClick={reset}
          className="mt-6 inline-block px-5 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#1E50A2' }}
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
