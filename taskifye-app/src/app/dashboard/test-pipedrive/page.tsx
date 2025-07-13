'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { pipedriveStorage } from '@/lib/integrations/pipedrive'
import { Loader2, Check, X } from 'lucide-react'

export default function TestPipedrivePage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  const addResult = (test: string, success: boolean, details: any) => {
    setResults(prev => [...prev, { test, success, details, timestamp: new Date() }])
  }

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setLoading(testName)
    try {
      await testFn()
    } catch (error) {
      addResult(testName, false, error)
    } finally {
      setLoading(null)
    }
  }

  const testConnection = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      addResult('Connection Test', false, 'No API key found')
      return
    }

    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test', apiKey })
    })

    const result = await response.json()
    addResult('Connection Test', result.success, result)
  }

  const testGetDeals = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getDeals', apiKey, limit: 5 })
    })

    const result = await response.json()
    addResult('Get Deals', result.success, result)
  }

  const testCreateContact = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    const testContact = {
      name: `Test Contact ${Date.now()}`,
      email: [`test${Date.now()}@example.com`],
      phone: ['+1234567890']
    }

    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createPerson', apiKey, ...testContact })
    })

    const result = await response.json()
    addResult('Create Contact', result.success, result)
  }

  const testCreateDeal = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    const testDeal = {
      title: `Test Deal ${Date.now()}`,
      value: 1000,
      currency: 'USD'
    }

    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createDeal', apiKey, ...testDeal })
    })

    const result = await response.json()
    addResult('Create Deal', result.success, result)
  }

  const testGetStats = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getStats', apiKey })
    })

    const result = await response.json()
    addResult('Get Stats', result.success, result)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Test Pipedrive Integration</h1>
        <p className="text-muted-foreground">
          Run tests to verify Pipedrive API connection and functionality
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
            <CardDescription>Test various Pipedrive API operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => runTest('Connection', testConnection)}
                disabled={loading === 'Connection'}
              >
                {loading === 'Connection' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
              <Button 
                onClick={() => runTest('GetDeals', testGetDeals)}
                disabled={loading === 'GetDeals'}
              >
                {loading === 'GetDeals' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Deals
              </Button>
              <Button 
                onClick={() => runTest('CreateContact', testCreateContact)}
                disabled={loading === 'CreateContact'}
              >
                {loading === 'CreateContact' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Contact
              </Button>
              <Button 
                onClick={() => runTest('CreateDeal', testCreateDeal)}
                disabled={loading === 'CreateDeal'}
              >
                {loading === 'CreateDeal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Deal
              </Button>
              <Button 
                onClick={() => runTest('GetStats', testGetStats)}
                disabled={loading === 'GetStats'}
              >
                {loading === 'GetStats' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Stats
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results from API tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.length === 0 ? (
                <p className="text-muted-foreground">No tests run yet</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        {result.success ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        {result.test}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}