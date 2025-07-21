'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MobileNav } from '@/components/layout/mobile-nav'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'
import { ClientSwitcher } from '@/components/layout/client-switcher'

export default function DashboardHeader() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="h-14 lg:h-16 border-b bg-background px-4 lg:px-6 flex items-center justify-between">
      {/* Mobile Menu */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Search - Desktop */}
      <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, customers, invoices..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Logo/Brand - Mobile */}
      <div className="lg:hidden flex-1 text-center">
        <Link href="/dashboard">
          <h1 className="text-lg font-semibold cursor-pointer hover:opacity-80 transition-opacity">Taskifye</h1>
        </Link>
      </div>

      {/* Client Switcher - Desktop */}
      <div className="hidden lg:flex">
        <ClientSwitcher />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Mobile Search */}
        <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="h-auto">
            <div className="py-4">
              <Input
                placeholder="Search..."
                className="w-full"
                autoFocus
              />
            </div>
          </SheetContent>
        </Sheet>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Avatar - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3 ml-3 pl-3 border-l">
          <div className="text-right">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@hvacpro.com</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
        </div>
        
        {/* Mobile Avatar */}
        <div className="lg:hidden h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
      </div>
    </header>
  )
}