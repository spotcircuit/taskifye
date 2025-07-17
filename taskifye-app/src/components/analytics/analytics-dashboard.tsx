'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, TrendingDown, Calendar, Download, 
  DollarSign, Users, Briefcase, Clock,
  BarChart3, LineChart, PieChart, FileText,
  Loader2, Target, Activity
} from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts'

interface AnalyticsData {
  deals: any[]
  contacts: any[]
  activities: any[]
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899']

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({ deals: [], contacts: [], activities: [] })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('this_month')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      setError('Please connect Pipedrive in the Integrations page')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const pipedrive = new PipedriveService(apiKey)
      
      // Fetch all data in parallel
      const [dealsResponse, personsResponse, activitiesResponse] = await Promise.all([
        pipedrive.getDeals({ status: 'all_not_deleted' }),
        pipedrive.getPersons(),
        pipedrive.getActivities()
      ])
      
      setData({
        deals: dealsResponse.success ? dealsResponse.deals || [] : [],
        contacts: personsResponse.success ? personsResponse.persons || [] : [],
        activities: activitiesResponse.success ? activitiesResponse.data || [] : []
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate date ranges based on selected period
  const dateRange = useMemo(() => {
    const now = new Date()
    switch (selectedPeriod) {
      case 'today':
        return { start: new Date(now.setHours(0,0,0,0)), end: new Date(now.setHours(23,59,59,999)) }
      case 'this_week':
        return { start: startOfWeek(now), end: endOfWeek(now) }
      case 'last_week':
        return { start: startOfWeek(subWeeks(now, 1)), end: endOfWeek(subWeeks(now, 1)) }
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'last_month':
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }, [selectedPeriod])

  // Filter deals by date range
  const filteredDeals = useMemo(() => {
    return data.deals.filter(deal => {
      const dealDate = new Date(deal.add_time)
      return dealDate >= dateRange.start && dealDate <= dateRange.end
    })
  }, [data.deals, dateRange])

  // Calculate KPIs from real data
  const kpis = useMemo(() => {
    const totalRevenue = data.deals
      .filter(d => d.status === 'won')
      .reduce((sum, deal) => sum + (deal.value || 0), 0)
    
    const wonDealsCount = data.deals.filter(d => d.status === 'won').length
    const newCustomers = data.contacts.filter(contact => {
      const addDate = new Date(contact.add_time)
      return addDate >= dateRange.start && addDate <= dateRange.end
    }).length

    const avgDealSize = wonDealsCount > 0 ? totalRevenue / wonDealsCount : 0
    
    // Calculate win rate
    const closedDeals = data.deals.filter(d => d.status === 'won' || d.status === 'lost')
    const winRate = closedDeals.length > 0 ? (wonDealsCount / closedDeals.length) * 100 : 0

    return {
      totalRevenue,
      wonDealsCount,
      newCustomers,
      avgDealSize,
      winRate,
      openDealsValue: data.deals
        .filter(d => d.status === 'open')
        .reduce((sum, deal) => sum + (deal.value || 0), 0)
    }
  }, [data, dateRange])

  // Prepare revenue trend data
  const revenueTrendData = useMemo(() => {
    // Group deals by month for the last 6 months
    const monthlyData: Record<string, number> = {}
    const now = new Date()
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i)
      const monthKey = format(month, 'MMM yyyy')
      monthlyData[monthKey] = 0
    }

    // Sum revenue by month
    data.deals
      .filter(d => d.status === 'won')
      .forEach(deal => {
        const dealDate = new Date(deal.won_time || deal.update_time)
        const monthKey = format(dealDate, 'MMM yyyy')
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += deal.value || 0
        }
      })

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }))
  }, [data.deals])

  // Prepare pipeline stages data
  const pipelineData = useMemo(() => {
    const stages: Record<number, { name: string; count: number; value: number }> = {}
    
    data.deals
      .filter(d => d.status === 'open')
      .forEach(deal => {
        if (!stages[deal.stage_id]) {
          stages[deal.stage_id] = { 
            name: `Stage ${deal.stage_id}`, // Would need stage names from API
            count: 0, 
            value: 0 
          }
        }
        stages[deal.stage_id].count++
        stages[deal.stage_id].value += deal.value || 0
      })

    return Object.entries(stages).map(([stageId, data]) => ({
      stage: data.name,
      deals: data.count,
      value: data.value
    }))
  }, [data.deals])

  // Prepare activity types data
  const activityTypesData = useMemo(() => {
    const types: Record<string, number> = {}
    
    data.activities.forEach(activity => {
      const type = activity.type || 'other'
      types[type] = (types[type] || 0) + 1
    })

    return Object.entries(types).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count
    }))
  }, [data.activities])

  // Prepare conversion funnel data
  const conversionFunnelData = useMemo(() => {
    const totalLeads = data.contacts.length
    const qualifiedLeads = data.contacts.filter(c => c.deals_count > 0).length
    const opportunities = data.deals.length
    const wonDeals = data.deals.filter(d => d.status === 'won').length

    return [
      { stage: 'Leads', value: totalLeads, percentage: 100 },
      { stage: 'Qualified', value: qualifiedLeads, percentage: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0 },
      { stage: 'Opportunities', value: opportunities, percentage: totalLeads > 0 ? (opportunities / totalLeads) * 100 : 0 },
      { stage: 'Won', value: wonDeals, percentage: totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0 }
    ]
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Real-time business insights from Pipedrive
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.wonDealsCount} deals won
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.openDealsValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.deals.filter(d => d.status === 'open').length} open deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average deal size: ${kpis.avgDealSize.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.newCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total contacts: {data.contacts.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Pipeline by Stage
            </CardTitle>
            <CardDescription>Current deals distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any, name: string) => 
                  name === 'value' ? `$${value.toLocaleString()}` : value
                } />
                <Legend />
                <Bar yAxisId="left" dataKey="deals" fill="#3B82F6" name="Deal Count" />
                <Bar yAxisId="right" dataKey="value" fill="#10B981" name="Total Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Activity Breakdown
            </CardTitle>
            <CardDescription>Types of activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={activityTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>Lead to customer journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionFunnelData.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">{stage.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${stage.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {stage.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Contact categorization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Active Customers</span>
                </div>
                <span className="text-sm">{data.contacts.filter(c => c.deals_count > 0).length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Qualified Leads</span>
                </div>
                <span className="text-sm">{data.contacts.filter(c => c.activities_count > 0 && c.deals_count === 0).length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-sm font-medium">New Leads</span>
                </div>
                <span className="text-sm">{data.contacts.filter(c => c.activities_count === 0 && c.deals_count === 0).length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">High Value</span>
                </div>
                <span className="text-sm">{data.contacts.filter(c => c.won_deals_count > 2).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deal Velocity</CardTitle>
            <CardDescription>Average time to close by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-3xl font-bold">
                  {(() => {
                    const wonDeals = data.deals.filter(d => d.status === 'won' && d.won_time)
                    if (wonDeals.length === 0) return '0'
                    
                    const totalDays = wonDeals.reduce((sum, deal) => {
                      const start = new Date(deal.add_time)
                      const end = new Date(deal.won_time!)
                      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                      return sum + days
                    }, 0)
                    
                    return Math.round(totalDays / wonDeals.length)
                  })()}
                </p>
                <p className="text-sm text-muted-foreground">Average days to close</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Sales team leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const ownerStats: Record<string, { name: string; deals: number; value: number }> = {}
                
                data.deals
                  .filter(d => d.status === 'won' && d.owner_id)
                  .forEach(deal => {
                    const ownerId = deal.owner_id.value.toString()
                    if (!ownerStats[ownerId]) {
                      ownerStats[ownerId] = { 
                        name: deal.owner_id.name, 
                        deals: 0, 
                        value: 0 
                      }
                    }
                    ownerStats[ownerId].deals++
                    ownerStats[ownerId].value += deal.value || 0
                  })

                return Object.values(ownerStats)
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((owner, index) => (
                    <div key={owner.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-lg text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{owner.name}</p>
                          <p className="text-sm text-muted-foreground">{owner.deals} deals closed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${owner.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}