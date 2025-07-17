import DashboardNav from '@/components/dashboard/nav'
import DashboardHeader from '@/components/dashboard/header'
import { BrandingProvider } from '@/contexts/branding-context'
import { MobileBottomNav } from '@/components/layout/mobile-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BrandingProvider>
      <div className="flex h-screen">
        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:block">
          <DashboardNav />
        </div>
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-background pb-16 lg:pb-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </BrandingProvider>
  )
}