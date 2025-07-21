'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Save, Loader2, Key, AlertCircle, CheckCircle2, 
  Phone, Mail, Database, Globe, Zap
} from 'lucide-react'

interface Integration {
  name: string
  icon: React.ReactNode
  description: string
  fields: {
    key: string
    label: string
    type: string
    placeholder: string
    sensitive?: boolean
  }[]
  helpUrl?: string
}

const integrations: Integration[] = [
  {
    name: 'Pipedrive',
    icon: <Database className="h-5 w-5" />,
    description: 'CRM for managing customers, jobs, and deals',
    fields: [
      {
        key: 'pipedrive_api_key',
        label: 'API Key',
        type: 'password',
        placeholder: '••••••••••••••••••••••••••••••••',
        sensitive: true
      },
      {
        key: 'pipedrive_domain',
        label: 'Domain',
        type: 'text',
        placeholder: 'yourcompany.pipedrive.com'
      }
    ],
    helpUrl: 'https://pipedrive.readme.io/docs/how-to-find-the-api-token'
  },
  {
    name: 'ReachInbox',
    icon: <Mail className="h-5 w-5" />,
    description: 'Email marketing and automation platform',
    fields: [
      {
        key: 'reachinbox_api_key',
        label: 'API Key',
        type: 'password',
        placeholder: '••••••••••••••••••••••••••••••••',
        sensitive: true
      }
    ]
  },
  {
    name: 'Twilio',
    icon: <Phone className="h-5 w-5" />,
    description: 'SMS and voice communication',
    fields: [
      {
        key: 'twilio_account_sid',
        label: 'Account SID',
        type: 'text',
        placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxx'
      },
      {
        key: 'twilio_auth_token',
        label: 'Auth Token',
        type: 'password',
        placeholder: '••••••••••••••••••••••••••••••••',
        sensitive: true
      },
      {
        key: 'twilio_phone_number',
        label: 'Phone Number',
        type: 'text',
        placeholder: '+1234567890'
      }
    ]
  },
  {
    name: 'QuickBooks',
    icon: <Globe className="h-5 w-5" />,
    description: 'Accounting and invoicing integration',
    fields: [
      {
        key: 'quickbooks_client_id',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Your QuickBooks Client ID'
      },
      {
        key: 'quickbooks_client_secret',
        label: 'Client Secret',
        type: 'password',
        placeholder: '••••••••••••••••••••••••••••••••',
        sensitive: true
      }
    ]
  }
]

export function IntegrationsSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    setIsLoading(true)
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/settings/integrations', {
        headers: {
          'x-client-id': clientId
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(data.credentials || {})
        
        // Check which integrations have credentials
        const connected = new Set<string>()
        integrations.forEach(integration => {
          const hasAllFields = integration.fields.every(
            field => data.credentials?.[field.key]
          )
          if (hasAllFields) {
            connected.add(integration.name)
          }
        })
        setConnectedIntegrations(connected)
      }
    } catch (error) {
      console.error('Failed to load integrations:', error)
      toast({
        title: 'Failed to load integration settings',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (integrationName: string) => {
    setIsSaving(integrationName)
    
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/settings/integrations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId
        },
        body: JSON.stringify({
          credentials: formData
        })
      })
      
      if (!response.ok) throw new Error('Failed to save')
      
      // Update connected status
      const integration = integrations.find(i => i.name === integrationName)
      if (integration) {
        const hasAllFields = integration.fields.every(
          field => formData[field.key]
        )
        if (hasAllFields) {
          setConnectedIntegrations(prev => new Set([...prev, integrationName]))
        }
      }
      
      toast({
        title: `${integrationName} settings saved`,
        description: 'Your API credentials have been saved securely'
      })
    } catch (error) {
      console.error('Failed to save integration:', error)
      toast({
        title: 'Failed to save settings',
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(null)
    }
  }

  const handleTestConnection = async (integrationName: string) => {
    setIsTesting(integrationName)
    
    try {
      // First save the current form data
      await handleSave(integrationName)
      
      // Then test the connection
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      
      if (integrationName === 'Pipedrive') {
        const response = await fetch('/api/integrations/pipedrive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': clientId
          },
          body: JSON.stringify({
            action: 'test'
          })
        })
        
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Connection test failed')
        }
        
        toast({
          title: 'Connection successful!',
          description: `Connected to ${integrationName} successfully`,
        })
      } else {
        toast({
          title: 'Test not available',
          description: `Connection test not yet implemented for ${integrationName}`,
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      console.error('Connection test failed:', error)
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect to ' + integrationName,
        variant: 'destructive'
      })
    } finally {
      setIsTesting(null)
    }
  }

  const handleDisconnect = (integrationName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${integrationName}?`)) {
      return
    }
    
    const integration = integrations.find(i => i.name === integrationName)
    if (integration) {
      const newFormData = { ...formData }
      integration.fields.forEach(field => {
        delete newFormData[field.key]
      })
      setFormData(newFormData)
      setConnectedIntegrations(prev => {
        const newSet = new Set(prev)
        newSet.delete(integrationName)
        return newSet
      })
      
      // Save the changes
      handleSave(integrationName)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          Your API credentials are encrypted and stored securely. Never share your API keys publicly.
        </AlertDescription>
      </Alert>

      {integrations.map((integration) => {
        const isConnected = connectedIntegrations.has(integration.name)
        
        return (
          <Card key={integration.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {integration.icon}
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={isConnected ? 'default' : 'secondary'}>
                  {isConnected ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Connected
                    </>
                  ) : (
                    'Not Connected'
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={() => handleSave(integration.name)}
                  disabled={isSaving === integration.name || isTesting === integration.name}
                >
                  {isSaving === integration.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => handleTestConnection(integration.name)}
                  disabled={isTesting === integration.name || isSaving === integration.name}
                >
                  {isTesting === integration.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
                
                {isConnected && (
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnect(integration.name)}
                    disabled={isSaving === integration.name || isTesting === integration.name}
                  >
                    Disconnect
                  </Button>
                )}
                
                {integration.helpUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={integration.helpUrl} target="_blank" rel="noopener noreferrer">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Help
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}