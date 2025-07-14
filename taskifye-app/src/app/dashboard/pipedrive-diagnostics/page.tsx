'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, Loader2, CheckCircle, AlertCircle, 
  Building, Users, Briefcase, Calendar,
  RefreshCw, Eye
} from 'lucide-react'
import { pipedriveStorage } from '@/lib/integrations/pipedrive'
import { SimplePipedriveClient } from '@/lib/pipedrive-simple'

interface DiagnosticData {
  connection: any
  deals: any
  persons: any
  organizations: any
  activities: any
  pipelines: any
  stages: any
}

export default function PipedriveDiagnosticsPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DiagnosticData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      setError('Please connect to Pipedrive first from the Integrations page')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = new SimplePipedriveClient(apiKey)
      
      console.log('🔍 Running Pipedrive diagnostics...')
      
      // Test connection
      console.log('Testing connection...')
      const connection = await client.testConnection()
      console.log('Connection result:', connection)
      
      // Get existing data
      console.log('Fetching deals...')
      const deals = await client.getDeals({ limit: 100 })
      console.log('Deals result:', deals)
      
      console.log('Fetching organizations...')
      const organizations = await client.getOrganizations({ limit: 100 })
      console.log('Organizations result:', organizations)
      
      console.log('Fetching persons...')
      const persons = await client.getPersons({ limit: 100 })
      console.log('Persons result:', persons)
      
      console.log('Fetching activities...')
      const activities = await client.getActivities({ limit: 100 })
      console.log('Activities result:', activities)
      
      console.log('Fetching pipelines...')
      const pipelines = await client.getPipelines()
      console.log('Pipelines result:', pipelines)
      
      console.log('Fetching stages...')
      const stages = await client.getStages()
      console.log('Stages result:', stages)

      setData({
        connection,
        deals,
        persons,
        organizations,
        activities,
        pipelines,
        stages
      })

    } catch (error: any) {
      console.error('Diagnostics error:', error)
      setError(error.message || 'Failed to run diagnostics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const apiKey = pipedriveStorage.getApiKey()
    if (apiKey) {
      runDiagnostics()
    }
  }, [])

  const DataCard = ({ title, data, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data?.success ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            {data.deals && (
              <p className="text-sm text-muted-foreground">
                {data.deals.length} items found
              </p>
            )}
            {data.organizations && (
              <p className="text-sm text-muted-foreground">
                {data.organizations.length} items found
              </p>
            )}
            {data.persons && (
              <p className="text-sm text-muted-foreground">
                {data.persons.length} items found
              </p>
            )}
            {data.activities && (
              <p className="text-sm text-muted-foreground">
                {data.activities.length} items found
              </p>
            )}
            {data.pipelines && (
              <p className="text-sm text-muted-foreground">
                {data.pipelines.length} items found
              </p>
            )}
            {data.stages && (
              <p className="text-sm text-muted-foreground">
                {data.stages.length} items found
              </p>
            )}
            {data.user && (
              <div className="text-sm">
                <p className="font-medium">{data.user.name}</p>
                <p className="text-muted-foreground">{data.user.email}</p>
                <p className="text-muted-foreground">{data.user.company_name}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600">
              {data?.error || 'Failed to fetch'}
            </span>
          </div>
        )}
        
        {/* Show raw data for debugging */}
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            Raw Data (Debug)
          </summary>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Pipedrive Diagnostics</h1>
          <p className="text-muted-foreground mt-2">
            Check your Pipedrive connection and existing data
          </p>
        </div>
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DataCard
            title="Connection"
            data={data.connection}
            icon={Database}
            color="text-blue-500"
          />
          
          <DataCard
            title="Organizations"
            data={data.organizations}
            icon={Building}
            color="text-purple-500"
          />
          
          <DataCard
            title="Persons"
            data={data.persons}
            icon={Users}
            color="text-green-500"
          />
          
          <DataCard
            title="Deals"
            data={data.deals}
            icon={Briefcase}
            color="text-orange-500"
          />
          
          <DataCard
            title="Activities"
            data={data.activities}
            icon={Calendar}
            color="text-red-500"
          />
          
          <DataCard
            title="Pipelines"
            data={data.pipelines}
            icon={Database}
            color="text-indigo-500"
          />
        </div>
      )}

      {/* Summary */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Current state of your Pipedrive data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.organizations?.organizations?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Organizations</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.persons?.persons?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Persons</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.deals?.deals?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Deals</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.activities?.activities?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Activities</div>
              </div>
            </div>

            {data.connection?.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Connection Successful</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Connected as {data.connection.user?.name} ({data.connection.user?.email})
                  <br />
                  Company: {data.connection.user?.company_name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}