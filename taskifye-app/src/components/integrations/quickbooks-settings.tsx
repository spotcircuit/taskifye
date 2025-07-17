'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, 
  RefreshCw, Link, Unlink, Settings, DollarSign,
  FileText, Users, TrendingUp, Calculator
} from 'lucide-react'
import { QuickBooksService, quickBooksStorage } from '@/lib/integrations/quickbooks'

export function QuickBooksSettings() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    environment: 'sandbox' as 'sandbox' | 'production',
    autoSync: true,
    syncInterval: 15, // minutes
    commissionTracking: true,
    defaultCommissionRate: 10,
    jobCosting: true,
    classTracking: true
  })
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null as Date | null,
    customerssynced: 0,
    invoicesSynced: 0,
    errors: 0
  })

  useEffect(() => {
    // Check if already connected
    const tokens = quickBooksStorage.getTokens()
    if (tokens) {
      setConnected(true)
      // Load saved config
      const savedConfig = localStorage.getItem('quickbooks_config')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    }
  }, [])

  const handleConnect = async () => {
    if (!config.clientId || !config.clientSecret) {
      alert('Please enter QuickBooks Client ID and Secret')
      return
    }

    setLoading(true)
    try {
      // Save config
      localStorage.setItem('quickbooks_config', JSON.stringify(config))

      // Initialize QuickBooks service
      const qb = new QuickBooksService({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: `${window.location.origin}/api/quickbooks/callback`,
        environment: config.environment
      })

      // Generate state for security
      const state = Math.random().toString(36).substring(7)
      localStorage.setItem('quickbooks_oauth_state', state)

      // Redirect to QuickBooks OAuth
      const authUrl = qb.getAuthorizationUrl(state)
      window.location.href = authUrl
    } catch (error) {
      console.error('Error connecting to QuickBooks:', error)
      alert('Failed to connect to QuickBooks')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect QuickBooks?')) {
      quickBooksStorage.clearTokens()
      localStorage.removeItem('quickbooks_config')
      setConnected(false)
    }
  }

  const syncNow = async () => {
    setLoading(true)
    try {
      // This would trigger a full sync with QuickBooks
      const response = await fetch('/api/quickbooks/sync', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        setSyncStatus({
          lastSync: new Date(),
          customerssynced: result.customers,
          invoicesSynced: result.invoices,
          errors: result.errors
        })
        alert('Sync completed successfully!')
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Sync failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>QuickBooks Integration</CardTitle>
              <CardDescription>
                Connect your QuickBooks account for automated invoicing and accounting
              </CardDescription>
            </div>
            <Badge variant={connected ? 'default' : 'secondary'}>
              {connected ? (
                <>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-4 w-4" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!connected ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To connect QuickBooks, you'll need to create an app in the QuickBooks Developer Portal
                  and obtain your Client ID and Client Secret.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    placeholder="Enter your QuickBooks Client ID"
                    value={config.clientId}
                    onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter your QuickBooks Client Secret"
                    value={config.clientSecret}
                    onChange={(e) => setConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Environment</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={config.environment}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      environment: e.target.value as 'sandbox' | 'production' 
                    }))}
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <Button 
                  onClick={handleConnect} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Link className="mr-2 h-4 w-4" />
                  Connect QuickBooks
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sync Status */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Sync Status</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={syncNow}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sync Now
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Last Sync</p>
                    <p className="font-medium">
                      {syncStatus.lastSync 
                        ? syncStatus.lastSync.toLocaleString() 
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customers</p>
                    <p className="font-medium">{syncStatus.customerssynced}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoices</p>
                    <p className="font-medium">{syncStatus.invoicesSynced}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="w-full"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect QuickBooks
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>
            Configure how Taskifye syncs with QuickBooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync data between systems
              </p>
            </div>
            <Switch
              checked={config.autoSync}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, autoSync: checked }))
              }
            />
          </div>

          {config.autoSync && (
            <div className="space-y-2">
              <Label>Sync Interval (minutes)</Label>
              <Input
                type="number"
                value={config.syncInterval}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  syncInterval: parseInt(e.target.value) || 15 
                }))}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Commission Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Automatically calculate sales commissions
              </p>
            </div>
            <Switch
              checked={config.commissionTracking}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, commissionTracking: checked }))
              }
            />
          </div>

          {config.commissionTracking && (
            <div className="space-y-2">
              <Label>Default Commission Rate (%)</Label>
              <Input
                type="number"
                value={config.defaultCommissionRate}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  defaultCommissionRate: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Job Costing</Label>
              <p className="text-sm text-muted-foreground">
                Track costs and profitability by job
              </p>
            </div>
            <Switch
              checked={config.jobCosting}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, jobCosting: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Class Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Use QuickBooks classes for job categorization
              </p>
            </div>
            <Switch
              checked={config.classTracking}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, classTracking: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>QuickBooks Features</CardTitle>
          <CardDescription>
            What you can do with QuickBooks integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Automated Invoicing</h4>
                <p className="text-sm text-muted-foreground">
                  Convert approved estimates to QuickBooks invoices with one click
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Users className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Customer Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Keep customer data synchronized between systems
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Calculator className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Commission Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically calculate and track sales commissions
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Financial Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Pull P&L, balance sheets, and job profitability reports
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}