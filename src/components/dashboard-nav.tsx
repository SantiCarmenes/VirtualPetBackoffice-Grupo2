'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Package, Truck, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authService } from '@/services/authService'
import { User } from '@/types/shipment'

const navItems = [
  { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, color: 'primary' },
  { href: '/pending', label: 'Pendientes', icon: Package, color: 'status-pending' },
  { href: '/shipments', label: 'Envíos', icon: Truck, color: 'status-in-transit' },
]

export function DashboardNav({ user, children }: { user: User | null; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      router.push('/login')
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <span className="text-lg font-semibold text-sidebar-foreground">VP Backoffice</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const colorClass =
              item.color === 'primary'
                ? 'border-l-primary'
                : item.color === 'status-pending'
                  ? 'border-l-status-pending'
                  : item.color === 'status-in-transit'
                    ? 'border-l-status-in-transit'
                    : 'border-l-status-cancelled'

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md border-l-4 px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? `bg-sidebar-accent text-sidebar-accent-foreground ${colorClass}`
                    : 'border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-2 text-xs text-sidebar-foreground/60">
            {user?.firstName || user?.email || 'Invitado'}
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Mobile + Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-sidebar px-4 md:hidden">
          <span className="text-lg font-semibold text-sidebar-foreground">VP Backoffice</span>
          <Button variant="ghost" size="sm" className="text-sidebar-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <nav className="flex border-b bg-sidebar md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const borderColor =
              item.color === 'primary'
                ? 'border-primary'
                : item.color === 'status-pending'
                  ? 'border-status-pending'
                  : item.color === 'status-in-transit'
                    ? 'border-status-in-transit'
                    : 'border-status-cancelled'

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium transition-colors',
                  isActive
                    ? `border-b-2 ${borderColor} text-sidebar-foreground`
                    : 'text-sidebar-foreground/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <main className="flex-1 bg-background p-4 md:p-6">{children}</main>
      </div>
    </>
  )
}
