'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Database, Key, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TestResult {
  loading?: boolean
  success?: boolean
  data?: any
  error?: string
  status?: number
}

interface TestResults {
  pipedrive?: TestResult
  reachinbox?: TestResult
}

interface DebugInfo {
  client?: {
    id: string
    name: string
    slug: string
  }
  apiSettings?: {
    hasRecord: boolean
    hasPipedriveKey: boolean
    hasReachInboxKey: boolean
    pipedriveDomain?: string
  }
  cache?: {
    pipedriveKey: string
    reachInboxKey: string
  }
}

export default function TestIntegrationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [testResults, setTestResults] = useState<TestResults>({})

  useEffect(() => {
    loadDebugInfo()
  }, [])

  const loadDebugInfo = async () => {
    setLoading(true)
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/debug/integrations', {
        headers: { 'x-client-id': clientId }
      })
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Failed to load debug info:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/debug/integrations', {
        method: 'POST',
        headers: { 'x-client-id': clientId }
      })
      const data = await response.json()
      
      toast({
        title: 'Cache cleared',
        description: data.message
      })
      
      // Reload debug info
      await loadDebugInfo()
    } catch (error) {
      toast({
        title: 'Failed to clear cache',
        variant: 'destructive'
      })
    }
  }

  const testPipedrive = async () => {
    setTestResults((prev: TestResults) => ({ ...prev, pipedrive: { loading: true } }))
    
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/integrations/pipedrive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId
        },
        body: JSON.stringify({ action: 'test' })
      })
      
      const data = await response.json()
      
      setTestResults((prev: TestResults) => ({
        ...prev,
        pipedrive: {
          success: response.ok,
          data,
          status: response.status
        }
      }))
    } catch (error) {
      setTestResults((prev: TestResults) => ({
        ...prev,
        pipedrive: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    }
  }

  const testReachInbox = async () => {
    setTestResults((prev: TestResults) => ({ ...prev, reachinbox: { loading: true } }))
    
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId
        },
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'API Test',
          content: 'Testing API connection'
        })
      })
      
      const data = await response.json()
      
      setTestResults((prev: TestResults) => ({
        ...prev,
        reachinbox: {
          success: response.ok,
          data,
          status: response.status
        }
      }))
    } catch (error) {
      setTestResults((prev: TestResults) => ({
        ...prev,
        reachinbox: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Debugging</h1>
          <p className="text-muted-foreground">Test and debug API integrations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDebugInfo} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={clearCache} variant="outline" size="sm">
            <Database className="mr-2 h-4 w-4" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Database & Cache Status</CardTitle>
          <CardDescription>Current state of API settings and cache</CardDescription>
        </CardHeader>
        <CardContent>
          {debugInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Client Info</h3>
                <div className="bg-muted p-3 rounded text-sm">
                  <div>ID: {debugInfo.client?.id}</div>
                  <div>Name: {debugInfo.client?.name}</div>
                  <div>Slug: {debugInfo.client?.slug}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">API Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {debugInfo.apiSettings?.hasRecord ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>Database record exists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {debugInfo.apiSettings?.hasPipedriveKey ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>Pipedrive API key stored</span>
                    {debugInfo.apiSettings?.pipedriveDomain && (
                      <Badge variant="secondary">{debugInfo.apiSettings.pipedriveDomain}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {debugInfo.apiSettings?.hasReachInboxKey ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>ReachInbox API key stored</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cache Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <span>Pipedrive: {debugInfo.cache?.pipedriveKey}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <span>ReachInbox: {debugInfo.cache?.reachInboxKey}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Tests */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipedrive Test</CardTitle>
            <CardDescription>Test Pipedrive API connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testPipedrive} className="w-full">
              {testResults.pipedrive?.loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Test Pipedrive Connection'
              )}
            </Button>
            
            {testResults.pipedrive && !testResults.pipedrive.loading && (
              <Alert variant={testResults.pipedrive.success ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">
                    Status: {testResults.pipedrive.status || 'N/A'}
                  </div>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(testResults.pipedrive.data || testResults.pipedrive.error, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ReachInbox Test</CardTitle>
            <CardDescription>Test ReachInbox API connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testReachInbox} className="w-full">
              {testResults.reachinbox?.loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Test ReachInbox Connection'
              )}
            </Button>
            
            {testResults.reachinbox && !testResults.reachinbox.loading && (
              <Alert variant={testResults.reachinbox.success ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">
                    Status: {testResults.reachinbox.status || 'N/A'}
                  </div>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(testResults.reachinbox.data || testResults.reachinbox.error, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Check the Database & Cache Status to see if API keys are stored</li>
            <li>If keys are in database but not in cache, click "Clear Cache"</li>
            <li>Test each integration to see the actual API response</li>
            <li>Go to Settings → Integrations to add/update API keys</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}