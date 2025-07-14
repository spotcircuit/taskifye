'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building2, Users, FileText, Settings, Plus, Search,
  BarChart3, Package, CreditCard, AlertCircle, CheckCircle,
  Globe, Palette, Database, Mail, Shield
} from 'lucide-react'

// Mock data for demonstration
const mockClients = [
  {
    id: '1',
    companyName: 'Cool Breeze HVAC',
    businessType: 'hvac',
    subscription: { plan: 'professional', status: 'active' },
    createdAt: '2024-01-15',
    monthlyRevenue: 2500,
    activeJobs: 47,
    totalCustomers: 312
  },
  {
    id: '2',
    companyName: 'Lightning Electric Solutions',
    businessType: 'electrical',
    subscription: { plan: 'starter', status: 'trial' },
    createdAt: '2024-02-01',
    monthlyRevenue: 1200,
    activeJobs: 23,
    totalCustomers: 145
  },
  {
    id: '3',
    companyName: 'AquaFlow Plumbing',
    businessType: 'plumbing',
    subscription: { plan: 'enterprise', status: 'active' },
    createdAt: '2023-11-20',
    monthlyRevenue: 4800,
    activeJobs: 89,
    totalCustomers: 567
  }
]

const deploymentTemplates = [
  {
    id: '1',
    name: 'HVAC Quick Start',
    businessType: 'hvac',
    description: 'Complete HVAC business setup with service types, custom fields, and workflows',
    clientsUsing: 12
  },
  {
    id: '2',
    name: 'Electrical Pro',
    businessType: 'electrical',
    description: 'Electrical contractor setup with safety checklists and permit tracking',
    clientsUsing: 8
  },
  {
    id: '3',
    name: 'Plumbing Enterprise',
    businessType: 'plumbing',
    description: 'Full plumbing business configuration with inventory and warranty tracking',
    clientsUsing: 15
  }
]

export default function AgencyDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')

  const stats = {
    totalClients: mockClients.length,
    activeClients: mockClients.filter(c => c.subscription.status === 'active').length,
    trialClients: mockClients.filter(c => c.subscription.status === 'trial').length,
    monthlyRevenue: mockClients.reduce((sum, c) => sum + c.monthlyRevenue, 0),
    totalJobs: mockClients.reduce((sum, c) => sum + c.activeJobs, 0),
    totalEndCustomers: mockClients.reduce((sum, c) => sum + c.totalCustomers, 0)
  }

  const planColors: Record<string, string> = {
    starter: 'bg-gray-100 text-gray-800',
    professional: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800'
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agency Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your field service business clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">{stats.activeClients} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trial Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.trialClients}</div>
            <p className="text-xs text-muted-foreground">Convert to paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Recurring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Across all clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">End Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEndCustomers}</div>
            <p className="text-xs text-muted-foreground">Total served</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Client Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(stats.monthlyRevenue / stats.activeClients).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">New client onboarded</p>
                    <p className="text-xs text-muted-foreground">Lightning Electric Solutions - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Template deployed</p>
                    <p className="text-xs text-muted-foreground">HVAC Quick Start to Cool Breeze - 5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Subscription upgraded</p>
                    <p className="text-xs text-muted-foreground">AquaFlow Plumbing to Enterprise - 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Trial ending soon</p>
                    <p className="text-xs text-muted-foreground">2 clients have trials ending this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start">
                  <Building2 className="mr-2 h-4 w-4" />
                  Onboard New Client
                </Button>
                <Button variant="outline" className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Deployment Template
                </Button>
                <Button variant="outline" className="justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Bulk Email
                </Button>
                <Button variant="outline" className="justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Backup All Client Data
                </Button>
                <Button variant="outline" className="justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Audit
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Company</th>
                      <th className="text-left p-4 font-medium">Business Type</th>
                      <th className="text-left p-4 font-medium">Plan</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Monthly Revenue</th>
                      <th className="text-left p-4 font-medium">Active Jobs</th>
                      <th className="text-left p-4 font-medium">Customers</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockClients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{client.companyName}</div>
                          <div className="text-sm text-muted-foreground">
                            Since {new Date(client.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{client.businessType}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={planColors[client.subscription.plan]}>
                            {client.subscription.plan}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={statusColors[client.subscription.status]}>
                            {client.subscription.status}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">
                          ${client.monthlyRevenue.toLocaleString()}
                        </td>
                        <td className="p-4">{client.activeJobs}</td>
                        <td className="p-4">{client.totalCustomers}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Deployment Templates</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deploymentTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">{template.businessType}</Badge>
                    </div>
                    <Badge variant="secondary">{template.clientsUsing} clients</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Palette className="mr-2 h-4 w-4" />
                      Customize
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Globe className="mr-2 h-4 w-4" />
                      Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Deployments Tab */}
        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Pipeline</CardTitle>
              <CardDescription>
                Automated client onboarding and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">1. Initial Setup</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Create Pipedrive account and API token</li>
                    <li>• Configure custom fields based on business type</li>
                    <li>• Set up pipeline stages</li>
                    <li>• Import initial data</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">2. Integration Configuration</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Connect ReachInbox for email automation</li>
                    <li>• Set up Calendly for scheduling</li>
                    <li>• Configure n8n workflows</li>
                    <li>• Test all API connections</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">3. Branding & Customization</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Upload company logo and branding</li>
                    <li>• Configure color scheme</li>
                    <li>• Set up email templates</li>
                    <li>• Customize service types</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">4. Training & Launch</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Provide admin training</li>
                    <li>• Create user accounts</li>
                    <li>• Run test transactions</li>
                    <li>• Go live monitoring</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Starter</span>
                    <span className="font-medium">$1,200/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professional</span>
                    <span className="font-medium">$7,500/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enterprise</span>
                    <span className="font-medium">$4,800/mo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Renewals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cool Breeze HVAC</span>
                    <span className="text-muted-foreground">Feb 15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AquaFlow Plumbing</span>
                    <span className="text-muted-foreground">Feb 20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lightning Electric</span>
                    <span className="text-muted-foreground">Mar 1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All payments current</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Next billing cycle: Feb 1, 2024
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}