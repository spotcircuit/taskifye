'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'
import { Users, TrendingUp, Activity, DollarSign, Loader2, AlertCircle } from 'lucide-react'

interface PipedriveStats {
  totalDeals: number
  dealsValue: number
  totalContacts: number
  pendingActivities: number
}

interface Deal {
  id: number
  title: string
  value: number
  currency: string
  person_name: string
  org_name: string
  stage_name: string
}

export function PipedriveWidget() {
  const [stats, setStats] = useState<PipedriveStats | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const apiKey = pipedriveStorage.getApiKey()
    if (apiKey) {
      setIsConnected(true)
      loadPipedriveData(apiKey)
    } else {
      setLoading(false)
    }
  }, [])

  const loadPipedriveData = async (apiKey: string) => {
    try {
      const pipedrive = new PipedriveService(apiKey)
      
      // Load stats and deals in parallel
      const [statsResult, dealsResult] = await Promise.all([
        pipedrive.getStats(),
        pipedrive.getDeals({ limit: 5 })
      ])

      if (statsResult.success) {
        setStats(statsResult.stats)
      }

      if (dealsResult.success) {
        // Format deals data properly
        const formattedDeals = dealsResult.deals.map((deal: any) => ({
          id: deal.id,
          title: deal.title,
          value: deal.value || 0,
          currency: deal.currency || 'USD',
          person_name: deal.person_id?.name || deal.person_name || null,
          org_name: deal.org_id?.name || deal.org_name || null,
          stage_name: deal.stage_id?.name || 'Pipeline'
        }))
        setDeals(formattedDeals)
      }

      if (!statsResult.success && !dealsResult.success) {
        setError('Failed to load Pipedrive data')
      }
    } catch (err) {
      setError('Error connecting to Pipedrive')
      console.error('Pipedrive error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Pipedrive CRM
          </CardTitle>
          <CardDescription>Connect your Pipedrive account to see your sales data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/dashboard/integrations'}
            className="w-full"
          >
            Connect Pipedrive
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Pipedrive CRM
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Pipedrive CRM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Pipedrive CRM
            </CardTitle>
            <CardDescription>Your sales pipeline overview</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.open('https://app.pipedrive.com', '_blank')}>
            Open Pipedrive
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Open Deals</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalDeals || 0}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Pipeline Value</span>
            </div>
            <p className="text-2xl font-bold">
              ${(stats?.dealsValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">Contacts</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalContacts || 0}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Activities</span>
            </div>
            <p className="text-2xl font-bold">{stats?.pendingActivities || 0}</p>
          </div>
        </div>

        {/* Recent Deals */}
        {deals.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Recent Deals</h3>
            <div className="space-y-2">
              {deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deal.person_name || deal.org_name || 'No contact'} • {deal.stage_name}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {deal.currency} {deal.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}