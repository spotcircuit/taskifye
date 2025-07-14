'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, Calendar, DollarSign, Clock, 
  Briefcase, CheckCircle, AlertCircle, TrendingUp,
  Plus, FileText, UserPlus, CalendarPlus
} from 'lucide-react'
import { PipedriveWidget } from '@/components/integrations/pipedrive-widget'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  const stats = [
    {
      title: 'Jobs Today',
      value: '8',
      description: '3 in progress',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'This Week Revenue',
      value: '$24,580',
      description: '+12% from last week',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Quotes',
      value: '12',
      description: '$45,200 potential',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed This Month',
      value: '47',
      description: '94% satisfaction',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const upcomingJobs = [
    { id: 1, customer: 'Johnson Residence', service: 'AC Installation', time: '9:00 AM', tech: 'Mike R.' },
    { id: 2, customer: 'ABC Office Building', service: 'HVAC Maintenance', time: '11:00 AM', tech: 'Sarah L.' },
    { id: 3, customer: 'Smith Home', service: 'Furnace Repair', time: '2:00 PM', tech: 'John D.' },
  ]

  const recentActivities = [
    { id: 1, type: 'completed', message: 'Job #1245 completed at Wilson Property', time: '30 min ago', icon: CheckCircle, color: 'text-green-600' },
    { id: 2, type: 'payment', message: 'Payment received from Garcia Industries - $3,450', time: '1 hour ago', icon: DollarSign, color: 'text-blue-600' },
    { id: 3, type: 'alert', message: 'Tomorrow: 5 scheduled maintenance visits', time: '2 hours ago', icon: AlertCircle, color: 'text-orange-600' },
    { id: 4, type: 'new', message: 'New quote request from Thompson Retail', time: '3 hours ago', icon: FileText, color: 'text-purple-600' },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning! 👋</h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/dashboard/jobs/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/contacts?action=new')}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
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

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {upcomingJobs.length} jobs scheduled for today
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/schedule')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground w-20">
                      {job.time}
                    </div>
                    <div>
                      <p className="font-medium">{job.customer}</p>
                      <p className="text-sm text-muted-foreground">{job.service}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {job.tech}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Takes 1 column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates across your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
          onClick={() => router.push('/dashboard/quotes/new')}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Create Quote</h3>
            <p className="text-sm text-muted-foreground mt-1">Generate new estimate</p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
          onClick={() => router.push('/dashboard/schedule')}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CalendarPlus className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Schedule Job</h3>
            <p className="text-sm text-muted-foreground mt-1">Book appointment</p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
          onClick={() => router.push('/dashboard/contacts')}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Manage Customers</h3>
            <p className="text-sm text-muted-foreground mt-1">View all contacts</p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
          onClick={() => router.push('/dashboard/reports')}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold">View Reports</h3>
            <p className="text-sm text-muted-foreground mt-1">Business insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed - CRM Timeline */}
      <ActivityFeed />

      {/* Pipedrive Widget - Now at the bottom */}
      <PipedriveWidget />
    </div>
  )
}