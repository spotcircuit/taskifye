'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, Users, Bell, CreditCard, Palette, Plug } from 'lucide-react'
import { BrandingSettings } from '@/components/settings/branding-settings'
import { CompanySettings } from '@/components/settings/company-settings'
import { IntegrationsSettings } from '@/components/settings/integrations-settings'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage your account and system preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl min-w-[600px]">
            <TabsTrigger value="company" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Building className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Company</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Palette className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Plug className="h-4 w-4" />
              <span className="text-xs sm:text-sm">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Users className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Team</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Billing</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-4">
          <CompanySettings />
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-4">
          <BrandingSettings />
        </TabsContent>

        {/* API/Integration Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsSettings />
        </TabsContent>

        {/* Team/Users */}
        <TabsContent value="users" className="space-y-4">
          <div className="text-muted-foreground">
            Team management coming soon...
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="text-muted-foreground">
            Notification preferences coming soon...
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <div className="text-muted-foreground">
            Billing management coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}