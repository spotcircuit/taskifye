'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataSeeder } from '@/components/admin/data-seeder'
import { 
  Database, Settings, Users, BarChart3,
  Shield, Key, RefreshCw, AlertTriangle
} from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Development tools and system administration
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">Development Environment</h3>
              <p className="text-sm text-orange-700 mt-1">
                This admin panel is intended for development and testing purposes only. 
                Do not use in production environments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tools Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Seeder */}
        <div className="lg:col-span-2">
          <DataSeeder />
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system health and integration status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">Pipedrive API</span>
              </div>
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">Database</span>
              </div>
              <span className="text-sm text-muted-foreground">Online</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-sm">Voice AI</span>
              </div>
              <span className="text-sm text-muted-foreground">Configured</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-sm">Email Service</span>
              </div>
              <span className="text-sm text-muted-foreground">Not configured</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">Sync All Data</div>
                  <div className="text-xs text-muted-foreground">Refresh from Pipedrive</div>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">Reset API Keys</div>
                  <div className="text-xs text-muted-foreground">Clear stored credentials</div>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">User Management</div>
                  <div className="text-xs text-muted-foreground">Manage user access</div>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">Security Audit</div>
                  <div className="text-xs text-muted-foreground">Review security logs</div>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
          <CardDescription>
            Current data counts and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Organizations</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Contacts</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Deals</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}