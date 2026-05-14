function Error({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#1E50A2', margin: 0 }}>{statusCode}</h1>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>
          {statusCode === 404 ? 'Página no encontrada' : 'Error del servidor'}
        </p>
        <a href="/dashboard" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.5rem 1.25rem', backgroundColor: '#1E50A2', color: '#fff', borderRadius: '0.75rem', textDecoration: 'none', fontSize: '0.875rem' }}>
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: { res?: { statusCode: number }; err?: { statusCode: number } }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
