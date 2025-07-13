'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'

const integrations = [
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'CRM and sales pipeline management',
    logo: '🎯',
    connected: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
  {
    id: 'reachinbox',
    name: 'ReachInbox',
    description: 'Email campaigns and sequences',
    logo: '📧',
    connected: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS messaging and communications',
    logo: '💬',
    connected: false,
    fields: [
      { name: 'account_sid', label: 'Account SID', type: 'text' },
      { name: 'auth_token', label: 'Auth Token', type: 'password' },
      { name: 'phone_number', label: 'Phone Number', type: 'text' },
    ],
  },
  {
    id: 'zapmail',
    name: 'Zapmail',
    description: 'Lead generation and enrichment',
    logo: '⚡',
    connected: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
]

export default function IntegrationsPage() {
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check for existing connections on load
    const checkConnections = async () => {
      const pipedriveKey = pipedriveStorage.getApiKey()
      if (pipedriveKey) {
        // Verify the connection is still valid
        try {
          const response = await fetch('/api/integrations/pipedrive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'test',
              apiKey: pipedriveKey
            })
          })
          const result = await response.json()
          
          if (result.success) {
            setConnectionStatus(prev => ({ ...prev, pipedrive: true }))
            setCredentials(prev => ({ 
              ...prev, 
              pipedrive: { 
                api_key: pipedriveKey,
                user_name: result.user.name,
                user_email: result.user.email
              } 
            }))
          } else {
            // Invalid key, remove it
            pipedriveStorage.removeApiKey()
          }
        } catch (error) {
          console.error('Failed to verify Pipedrive connection:', error)
        }
      }
    }
    
    checkConnections()
  }, [])

  const handleConnect = async (integrationId: string) => {
    setLoading(prev => ({ ...prev, [integrationId]: true }))
    
    try {
      if (integrationId === 'pipedrive') {
        const apiKey = credentials[integrationId]?.api_key
        if (!apiKey) {
          alert('Please enter your Pipedrive API key')
          return
        }

        const response = await fetch('/api/integrations/pipedrive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'test',
            apiKey
          })
        })
        const result = await response.json()

        if (result.success) {
          pipedriveStorage.setApiKey(apiKey)
          setConnectionStatus(prev => ({ ...prev, pipedrive: true }))
          // Store user info for display
          setCredentials(prev => ({ 
            ...prev, 
            pipedrive: { 
              ...prev.pipedrive,
              api_key: apiKey,
              user_name: result.user.name,
              user_email: result.user.email
            } 
          }))
          alert(`Connected to Pipedrive! Welcome ${result.user.name}`)
        } else {
          alert('Failed to connect: ' + result.error)
        }
      } else {
        // For other integrations, just show a message for now
        alert(`${integrationId} integration coming soon!`)
      }
    } catch (error) {
      alert('Connection error: ' + error)
    } finally {
      setLoading(prev => ({ ...prev, [integrationId]: false }))
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    if (integrationId === 'pipedrive') {
      pipedriveStorage.removeApiKey()
      setConnectionStatus(prev => ({ ...prev, pipedrive: false }))
      setCredentials(prev => ({ ...prev, pipedrive: {} }))
      alert('Disconnected from Pipedrive')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your favorite tools to Taskifye
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => {
          const isConnected = connectionStatus[integration.id] || false
          const isLoading = loading[integration.id] || false
          
          return (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{integration.logo}</span>
                  <div>
                    <CardTitle>{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                {isConnected ? (
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      Connected
                    </div>
                    {credentials[integration.id]?.user_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {credentials[integration.id].user_name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="h-4 w-4" />
                    Not connected
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {activeIntegration === integration.id ? (
                <div className="space-y-4">
                  {integration.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder={`Enter ${field.label}`}
                        value={credentials[integration.id]?.[field.name] || ''}
                        onChange={(e) => {
                          setCredentials({
                            ...credentials,
                            [integration.id]: {
                              ...credentials[integration.id],
                              [field.name]: e.target.value,
                            },
                          })
                        }}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleConnect(integration.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveIntegration(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isConnected ? 'outline' : 'default'}
                    onClick={() => setActiveIntegration(integration.id)}
                  >
                    {isConnected ? 'Update Settings' : 'Connect'}
                  </Button>
                  {isConnected && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )})}
      </div>
    </div>
  )
}