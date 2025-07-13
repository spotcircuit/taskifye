'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Cable, 
  Settings,
  Phone,
  Mail,
  Users,
  Package
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/deals', label: 'Deals & Offers', icon: Package },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Cable },
  { href: '/dashboard/test-pipedrive', label: 'Test API', icon: Settings },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex w-64 flex-col border-r border-border bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Taskifye</h1>
      </div>

      <div className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}