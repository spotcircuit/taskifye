import DashboardNav from '@/components/dashboard/nav'
import DashboardHeader from '@/components/dashboard/header'
import { BrandingProvider } from '@/contexts/branding-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BrandingProvider>
      <div className="flex h-screen">
        <DashboardNav />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </BrandingProvider>
  )
}