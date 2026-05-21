import { DashboardNav } from '@/components/dashboard-nav'
import { getServerUser } from '@/lib/serverData'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser().catch(() => null)

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={user}>{children}</DashboardNav>
    </div>
  )
}
