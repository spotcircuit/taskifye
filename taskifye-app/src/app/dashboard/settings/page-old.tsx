'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building, Users, Bell, CreditCard, Save, Palette
} from 'lucide-react'
import { BrandingSettings } from '@/components/settings/branding-settings'
import { CompanySettings } from '@/components/settings/company-settings'

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    name: 'HVAC Pro Services',
    email: 'admin@hvacpro.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Suite 100',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    timezone: 'America/Chicago',
  })

  const [notifications, setNotifications] = useState({
    newJobs: true,
    jobUpdates: true,
    paymentReceived: true,
    overdueInvoices: true,
    dailySummary: false,
    weeklySummary: true,
  })

  const [integrations, setIntegrations] = useState({
    pipedrive: { connected: true, apiKey: '•••••••••••••••' },
  })

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
          <TabsList className="grid grid-cols-5 w-full max-w-3xl min-w-[500px]">
            <TabsTrigger value="company" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Building className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Company</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Palette className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Users className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Users</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={companySettings.timezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Input
                  id="company-address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="company-city">City</Label>
                  <Input
                    id="company-city"
                    value={companySettings.city}
                    onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-state">State</Label>
                  <Input
                    id="company-state"
                    value={companySettings.state}
                    onChange={(e) => setCompanySettings({...companySettings, state: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-zip">ZIP Code</Label>
                  <Input
                    id="company-zip"
                    value={companySettings.zip}
                    onChange={(e) => setCompanySettings({...companySettings, zip: e.target.value})}
                  />
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-4">
          <BrandingSettings />
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage users and their permissions
                  </CardDescription>
                </div>
                <Button className="w-full sm:w-auto">
                  <Users className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Admin User', email: 'admin@company.com', role: 'Administrator', status: 'Active' },
                  { name: 'Mike Rodriguez', email: 'mike@company.com', role: 'Technician', status: 'Active' },
                  { name: 'Sarah Lopez', email: 'sarah@company.com', role: 'Technician', status: 'Active' },
                  { name: 'Office Manager', email: 'office@company.com', role: 'Manager', status: 'Active' },
                ].map((user) => (
                  <div key={user.email} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">{user.role}</p>
                        <p className="text-xs text-green-600">{user.status}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about important events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Jobs</p>
                    <p className="text-sm text-muted-foreground">Get notified when new jobs are created</p>
                  </div>
                  <Switch 
                    checked={notifications.newJobs}
                    onCheckedChange={(checked) => setNotifications({...notifications, newJobs: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Job Updates</p>
                    <p className="text-sm text-muted-foreground">Receive updates on job status changes</p>
                  </div>
                  <Switch 
                    checked={notifications.jobUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, jobUpdates: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Received</p>
                    <p className="text-sm text-muted-foreground">Alert when payments are received</p>
                  </div>
                  <Switch 
                    checked={notifications.paymentReceived}
                    onCheckedChange={(checked) => setNotifications({...notifications, paymentReceived: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Overdue Invoices</p>
                    <p className="text-sm text-muted-foreground">Remind about overdue payments</p>
                  </div>
                  <Switch 
                    checked={notifications.overdueInvoices}
                    onCheckedChange={(checked) => setNotifications({...notifications, overdueInvoices: checked})}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Email Summaries</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Summary</p>
                      <p className="text-sm text-muted-foreground">Get a daily overview of activities</p>
                    </div>
                    <Switch 
                      checked={notifications.dailySummary}
                      onCheckedChange={(checked) => setNotifications({...notifications, dailySummary: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Summary</p>
                      <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                    </div>
                    <Switch 
                      checked={notifications.weeklySummary}
                      onCheckedChange={(checked) => setNotifications({...notifications, weeklySummary: checked})}
                    />
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Manage your Taskifye subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">Professional Plan</h3>
                    <p className="mt-1 opacity-90 text-sm sm:text-base">Unlimited users, all features included</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl sm:text-3xl font-bold">$1,000</p>
                    <p className="text-sm opacity-90">per month</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Next billing date</p>
                  <p className="font-medium">February 1, 2024</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment method</p>
                  <p className="font-medium">Visa ending in 4242</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
                <Button variant="outline">
                  Download Invoice
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Usage This Month</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">12 / Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Jobs Created</span>
                    <span className="font-medium">186</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">SMS Sent</span>
                    <span className="font-medium">423</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Storage Used</span>
                    <span className="font-medium">2.3 GB / 100 GB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}