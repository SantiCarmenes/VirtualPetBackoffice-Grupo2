'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Error de aplicación</h1>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          {error.message || 'Ocurrió un error inesperado. Recargá la página o reintentá.'}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '1.25rem',
            padding: '0.5rem 1rem',
            background: '#1C1917',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  )
}
