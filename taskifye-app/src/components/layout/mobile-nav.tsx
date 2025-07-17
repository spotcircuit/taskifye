'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, X, Home, Briefcase, Users, Calendar, FileText, 
  DollarSign, BarChart3, Settings, Megaphone, Receipt,
  Phone, MessageSquare, Zap, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Quotes', href: '/dashboard/quotes', icon: FileText },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Voice AI', href: '/dashboard/voice-ai', icon: Phone },
  { name: 'Automations', href: '/dashboard/automations', icon: Zap },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Mobile Bottom Navigation for key actions
export function MobileBottomNav() {
  const pathname = usePathname()
  
  const bottomNavItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
    { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
    { name: 'More', href: '#', icon: Menu },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          
          if (item.name === 'More') {
            return (
              <MobileNav key={item.name} />
            )
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}