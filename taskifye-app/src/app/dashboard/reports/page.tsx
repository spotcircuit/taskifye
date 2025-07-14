'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, TrendingDown, Calendar, Download, 
  DollarSign, Users, Briefcase, Clock,
  BarChart3, LineChart, PieChart, FileText
} from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month')
  const [pipedriveData, setPipedriveData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPipedriveData()
  }, [])

  const fetchPipedriveData = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) return

    setLoading(true)
    try {
      const pipedrive = new PipedriveService(apiKey)
      const [dealsResponse, personsResponse] = await Promise.all([
        pipedrive.getDeals({ status: 'all_not_deleted' }),
        pipedrive.getPersons()
      ])
      
      setPipedriveData({
        deals: dealsResponse.success ? dealsResponse.deals : [],
        contacts: personsResponse.success ? personsResponse.persons : []
      })
    } catch (error) {
      console.error('Error fetching Pipedrive data:', error)
      setPipedriveData({ deals: [], contacts: [] })
    } finally {
      setLoading(false)
    }
  }
  
  const kpis = [
    {
      title: 'Revenue',
      value: '$125,450',
      change: '+15.3%',
      trend: 'up',
      period: 'vs last month',
      icon: DollarSign,
    },
    {
      title: 'Jobs Completed',
      value: '186',
      change: '+8.5%',
      trend: 'up',
      period: 'vs last month',
      icon: Briefcase,
    },
    {
      title: 'New Customers',
      value: '42',
      change: '-5.2%',
      trend: 'down',
      period: 'vs last month',
      icon: Users,
    },
    {
      title: 'Avg Job Time',
      value: '2.8 hrs',
      change: '-12%',
      trend: 'up',
      period: 'improvement',
      icon: Clock,
    },
  ]

  const topServices = [
    { service: 'AC Installation', jobs: 45, revenue: '$67,500' },
    { service: 'HVAC Maintenance', jobs: 78, revenue: '$23,400' },
    { service: 'Furnace Repair', jobs: 34, revenue: '$18,700' },
    { service: 'Emergency Service', jobs: 29, revenue: '$15,850' },
  ]

  const technicianPerformance = [
    { name: 'Mike Rodriguez', jobs: 52, revenue: '$38,450', rating: 4.8 },
    { name: 'Sarah Lopez', jobs: 48, revenue: '$35,200', rating: 4.9 },
    { name: 'John Davis', jobs: 43, revenue: '$31,750', rating: 4.7 },
    { name: 'Lisa Martinez', jobs: 43, revenue: '$20,050', rating: 4.6 },
  ]

  const monthlyRevenue = [
    { month: 'Aug', revenue: 95000 },
    { month: 'Sep', revenue: 102000 },
    { month: 'Oct', revenue: 98000 },
    { month: 'Nov', revenue: 112000 },
    { month: 'Dec', revenue: 108000 },
    { month: 'Jan', revenue: 125450 },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track business performance and gain insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={`flex items-center text-sm ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-600" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between gap-2">
              {monthlyRevenue.map((data) => {
                const height = (data.revenue / 125450) * 100
                return (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-t-md relative" style={{ height: '250px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-blue-600 rounded-t-md transition-all hover:bg-blue-700"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{data.month}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Service Distribution
            </CardTitle>
            <CardDescription>Revenue by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.service} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{service.service}</span>
                    <span className="text-sm text-muted-foreground">{service.revenue}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-600' :
                        index === 1 ? 'bg-green-600' :
                        index === 2 ? 'bg-purple-600' :
                        'bg-orange-600'
                      }`}
                      style={{ width: `${(parseInt(service.revenue.replace(/\D/g, '')) / 67500) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{service.jobs} jobs</span>
                    <span>{Math.round((parseInt(service.revenue.replace(/\D/g, '')) / 125450) * 100)}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Technician Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
            <CardDescription>Individual performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {technicianPerformance.map((tech) => (
                <div key={tech.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                    <div>
                      <p className="font-medium">{tech.name}</p>
                      <p className="text-sm text-muted-foreground">{tech.jobs} jobs completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{tech.revenue}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-600">★</span>
                      <span>{tech.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>Generate common reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Monthly Revenue Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Customer Acquisition Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                Job Completion Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Outstanding Payments Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Service Time Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>
              Breakdown by customer type and value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipedriveData && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">High Value</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {pipedriveData.contacts?.filter((c: any) => 
                          c.won_deals_count > 2
                        ).length || 0} customers
                      </p>
                      <p className="text-xs text-muted-foreground">3+ completed jobs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {pipedriveData.contacts?.filter((c: any) => 
                          c.activities_count > 0
                        ).length || 0} customers
                      </p>
                      <p className="text-xs text-muted-foreground">Recent activity</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500" />
                      <span className="text-sm font-medium">At Risk</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {pipedriveData.contacts?.filter((c: any) => 
                          c.lost_deals_count > 0
                        ).length || 0} customers
                      </p>
                      <p className="text-xs text-muted-foreground">Lost deals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      <span className="text-sm font-medium">New Leads</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {pipedriveData.contacts?.filter((c: any) => 
                          c.deals_count === 0
                        ).length || 0} leads
                      </p>
                      <p className="text-xs text-muted-foreground">No deals yet</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Health */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Health</CardTitle>
            <CardDescription>
              Current deals by stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipedriveData?.deals && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Open Deals</span>
                      <span className="font-medium">
                        {pipedriveData.deals.filter((d: any) => d.status === 'open').length}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(pipedriveData.deals.filter((d: any) => d.status === 'open').length / pipedriveData.deals.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        ${pipedriveData.deals
                          .filter((d: any) => d.status === 'open')
                          .reduce((sum: number, d: any) => sum + (d.value || 0), 0)
                          .toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Total pipeline value</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round(
                          pipedriveData.deals
                            .filter((d: any) => d.status === 'open')
                            .reduce((sum: number, d: any) => sum + (d.value || 0), 0) /
                          pipedriveData.deals.filter((d: any) => d.status === 'open').length || 0
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg deal size</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}