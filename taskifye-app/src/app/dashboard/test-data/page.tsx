'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Database, RefreshCw, CheckCircle, AlertCircle,
  Building, Users, Briefcase, Calendar, Phone,
  DollarSign, Clock, FileText, Loader2
} from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'
import { seedPipedriveData } from '@/lib/data/pipedrive-seeder'
import { format } from 'date-fns'

interface DataSummary {
  organizations: any[]
  persons: any[]
  deals: any[]
  activities: any[]
}

export default function TestDataPage() {
  const [data, setData] = useState<DataSummary>({
    organizations: [],
    persons: [],
    deals: [],
    activities: []
  })
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) return

    setLoading(true)
    try {
      const pipedrive = new PipedriveService(apiKey)
      
      const [orgsResponse, personsResponse, dealsResponse, activitiesResponse] = await Promise.all([
        pipedrive.getOrganizations(),
        pipedrive.getPersons(),
        pipedrive.getDeals({ status: 'all_not_deleted' }),
        pipedrive.getActivities()
      ])

      setData({
        organizations: orgsResponse.success ? orgsResponse.organizations : [],
        persons: personsResponse.success ? personsResponse.persons : [],
        deals: dealsResponse.success ? dealsResponse.deals : [],
        activities: activitiesResponse.success ? activitiesResponse.activities : []
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runSeeder = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      alert('Please connect to Pipedrive first')
      return
    }

    setSeeding(true)
    try {
      await seedPipedriveData(apiKey, {
        organizations: 15,
        persons: 30,
        deals: 75,
        activities: 150
      })
      
      // Refresh data after seeding
      await fetchAllData()
      alert('Data seeding completed successfully!')
    } catch (error) {
      console.error('Seeding error:', error)
      alert('Error during seeding: ' + (error as Error).message)
    } finally {
      setSeeding(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      open: { color: 'bg-blue-100 text-blue-800', label: 'Open' },
      won: { color: 'bg-green-100 text-green-800', label: 'Won' },
      lost: { color: 'bg-red-100 text-red-800', label: 'Lost' }
    }
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getTotalValue = () => {
    return data.deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Data Testing & Verification</h1>
          <p className="text-muted-foreground mt-2">
            Test data seeding and verify CRM data display across all components
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchAllData} 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Data
          </Button>
          <Button 
            onClick={runSeeder} 
            disabled={seeding || loading}
          >
            {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.organizations.length}</div>
            <p className="text-xs text-muted-foreground">
              {lastUpdated ? `Updated ${format(lastUpdated, 'HH:mm:ss')}` : 'Not loaded'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Persons (Contacts)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.persons.length}</div>
            <p className="text-xs text-muted-foreground">
              Individual contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Deals (Jobs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.deals.length}</div>
            <p className="text-xs text-muted-foreground">
              ${getTotalValue().toLocaleString()} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activities.length}</div>
            <p className="text-xs text-muted-foreground">
              Calls, meetings, tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Verification Tabs */}
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="persons">Persons</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizations ({data.organizations.length})</CardTitle>
              <CardDescription>
                Companies and business entities in Pipedrive
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.organizations.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No organizations found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Address</th>
                        <th className="text-left p-2">Phone</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">People Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.organizations.slice(0, 10).map((org) => (
                        <tr key={org.id} className="border-b">
                          <td className="p-2 font-medium">{org.name}</td>
                          <td className="p-2 text-sm text-gray-600">{org.address || 'N/A'}</td>
                          <td className="p-2 text-sm">{org.phone || 'N/A'}</td>
                          <td className="p-2 text-sm">{org.email || 'N/A'}</td>
                          <td className="p-2 text-sm">{org.people_count || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.organizations.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Showing 10 of {data.organizations.length} organizations
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Persons Tab */}
        <TabsContent value="persons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Persons ({data.persons.length})</CardTitle>
              <CardDescription>
                Individual contacts and customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.persons.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No persons found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Phone</th>
                        <th className="text-left p-2">Organization</th>
                        <th className="text-left p-2">Job Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.persons.slice(0, 10).map((person) => (
                        <tr key={person.id} className="border-b">
                          <td className="p-2 font-medium">{person.name}</td>
                          <td className="p-2 text-sm">{person.email?.[0]?.value || 'N/A'}</td>
                          <td className="p-2 text-sm">{person.phone?.[0]?.value || 'N/A'}</td>
                          <td className="p-2 text-sm">{person.org_id?.name || 'N/A'}</td>
                          <td className="p-2 text-sm">{person.job_title || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.persons.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Showing 10 of {data.persons.length} persons
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deals ({data.deals.length})</CardTitle>
              <CardDescription>
                Jobs and opportunities in the pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.deals.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No deals found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Value</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Person</th>
                        <th className="text-left p-2">Organization</th>
                        <th className="text-left p-2">Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.deals.slice(0, 10).map((deal) => (
                        <tr key={deal.id} className="border-b">
                          <td className="p-2 font-medium">{deal.title}</td>
                          <td className="p-2 text-sm font-medium text-green-600">
                            ${deal.value?.toLocaleString() || '0'}
                          </td>
                          <td className="p-2">{getStatusBadge(deal.status)}</td>
                          <td className="p-2 text-sm">{deal.person_id?.name || 'N/A'}</td>
                          <td className="p-2 text-sm">{deal.org_id?.name || 'N/A'}</td>
                          <td className="p-2 text-sm">Stage {deal.stage_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.deals.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Showing 10 of {data.deals.length} deals
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activities ({data.activities.length})</CardTitle>
              <CardDescription>
                Calls, meetings, tasks, and other activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.activities.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No activities found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Due Date</th>
                        <th className="text-left p-2">Person</th>
                        <th className="text-left p-2">Deal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.activities.slice(0, 10).map((activity) => (
                        <tr key={activity.id} className="border-b">
                          <td className="p-2 font-medium">{activity.subject}</td>
                          <td className="p-2 text-sm">
                            <Badge variant="outline">{activity.type}</Badge>
                          </td>
                          <td className="p-2">
                            {activity.done ? (
                              <Badge className="bg-green-100 text-green-800">Complete</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                          </td>
                          <td className="p-2 text-sm">
                            {activity.due_date ? format(new Date(activity.due_date), 'MMM d') : 'N/A'}
                          </td>
                          <td className="p-2 text-sm">{activity.person_id?.name || 'N/A'}</td>
                          <td className="p-2 text-sm">{activity.deal_id?.title || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.activities.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Showing 10 of {data.activities.length} activities
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>CRM Integration Test Results</CardTitle>
          <CardDescription>
            Verification that data flows correctly into all CRM components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Data Display Tests</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {data.deals.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Jobs Pipeline (Kanban) - {data.deals.length} deals</span>
                </div>
                <div className="flex items-center gap-2">
                  {data.activities.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Activity Feed - {data.activities.length} activities</span>
                </div>
                <div className="flex items-center gap-2">
                  {data.persons.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Contacts Management - {data.persons.length} contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  {data.organizations.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Organizations - {data.organizations.length} companies</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Quick Links to Test</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/dashboard/jobs">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Test Jobs Pipeline
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/dashboard">
                    <Calendar className="mr-2 h-4 w-4" />
                    Test Activity Feed
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/dashboard/contacts">
                    <Users className="mr-2 h-4 w-4" />
                    Test Contacts
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="/dashboard/reports">
                    <FileText className="mr-2 h-4 w-4" />
                    Test Reports
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}