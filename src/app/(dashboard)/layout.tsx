import { DashboardNav } from '@/components/dashboard-nav'
import { getServerUser } from '@/lib/serverData'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser().catch((e: unknown) => {
    // Let Next.js redirect errors propagate (e.g. redirect('/login') on 401)
    if (typeof e === 'object' && e !== null && 'digest' in e) throw e
    return null
  })

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={user}>{children}</DashboardNav>
    </div>
  )
}
