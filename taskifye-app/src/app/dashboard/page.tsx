import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, Phone, DollarSign } from 'lucide-react'
import { PipedriveWidget } from '@/components/integrations/pipedrive-widget'

export default function DashboardPage() {

  const stats = [
    {
      title: 'Active Contacts',
      value: '1,234',
      description: 'From Pipedrive',
      icon: Users,
    },
    {
      title: 'Emails Sent',
      value: '5,678',
      description: 'This month',
      icon: Mail,
    },
    {
      title: 'SMS Sent',
      value: '890',
      description: 'This month',
      icon: Phone,
    },
    {
      title: 'Revenue',
      value: '$12,345',
      description: 'This month',
      icon: DollarSign,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your business performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipedrive Integration Widget */}
      <div className="mt-8">
        <PipedriveWidget />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest interactions across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed will be loaded from integrated services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Send Campaign
            </button>
            <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              Add Contact
            </button>
            <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              View Reports
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}