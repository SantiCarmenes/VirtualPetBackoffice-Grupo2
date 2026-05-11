'use client'

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // TODO: activate login - remove this redirect, restore the login form
    router.replace('/shipments')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">Redirigiendo al panel de control...</p>
    </div>
  )
}
