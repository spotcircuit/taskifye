'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Briefcase,
  Calendar,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Cable, 
  Settings,
  TestTube,
  ChevronDown,
  Star,
  Phone,
  Bot,
  Mail,
  Zap,
  Database
} from 'lucide-react'
import { useState } from 'react'
import { useBranding } from '@/contexts/branding-context'

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
  { href: '/dashboard/contacts', label: 'Customers', icon: Users },
  { href: '/dashboard/quotes', label: 'Quotes', icon: FileText },
  { href: '/dashboard/invoices', label: 'Invoices', icon: DollarSign },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Mail },
  { href: '/dashboard/automations', label: 'Automations', icon: Zap },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/reports', label: 'Reports', icon: TrendingUp },
]

const settingsNavItems = [
  { href: '/dashboard/voice-ai', label: 'Voice AI', icon: Phone },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Cable },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const devNavItems = [
  { href: '/dashboard/pipedrive-diagnostics', label: 'Pipedrive Diagnostics', icon: Database },
  { href: '/dashboard/execute-seeding', label: 'Execute Seeding', icon: Database },
  { href: '/dashboard/admin', label: 'Admin Panel', icon: Settings },
  { href: '/dashboard/test-data', label: 'Test Data & CRM', icon: TestTube },
  { href: '/dashboard/test-pipedrive', label: 'Test API', icon: TestTube },
  { href: '/dashboard/test-pipedrive-enhanced', label: 'Test Enhanced', icon: TestTube },
  { href: '/dashboard/test-email', label: 'Test Email', icon: Mail },
  { href: '/dashboard/test-integrations', label: 'Test Integrations', icon: Zap },
  { href: '/dashboard/receptionist-demo', label: 'Receptionist Demo', icon: Bot },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { branding, isLoading } = useBranding()
  const [showDev, setShowDev] = useState(false)

  const NavLink = ({ item }: { item: any }) => {
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    )
  }

  return (
    <nav className="flex w-64 flex-col border-r border-border bg-card h-screen">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          {branding.logoUrl && (
            <img 
              src={branding.logoUrl} 
              alt={`${branding.companyName} logo`}
              className="h-8 w-8 object-contain"
            />
          )}
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isLoading ? 'Loading...' : branding.companyName}
            </h1>
            {branding.slogan && (
              <p className="text-xs text-muted-foreground mt-1">{branding.slogan}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Settings Section */}
          <div className="mt-8">
            <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System
            </h3>
            <div className="space-y-1">
              {settingsNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>

          {/* Dev Tools (Collapsible) */}
          <div className="mt-8">
            <button
              onClick={() => setShowDev(!showDev)}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showDev ? 'rotate-180' : ''}`} />
              Developer
            </button>
            {showDev && (
              <div className="mt-2 space-y-1">
                {devNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@company.com</p>
          </div>
        </div>
      </div>
    </nav>
  )
}