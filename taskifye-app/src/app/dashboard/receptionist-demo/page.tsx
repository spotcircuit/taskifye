'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import ChatWidget from '@/components/receptionist/chat-widget'
import { Bot, Code, MessageSquare, Settings } from 'lucide-react'

export default function ReceptionistDemoPage() {
  const [showWidget, setShowWidget] = useState(true)
  const [widgetPosition, setWidgetPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
  const [allowVoice, setAllowVoice] = useState(true)
  const [businessName, setBusinessName] = useState('HVAC Pro Services')

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Receptionist Bot Demo</h1>
        <p className="text-muted-foreground mt-2">
          Test the AI receptionist chat widget with n8n integration
        </p>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Widget Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Widget Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showWidget}
                  onCheckedChange={setShowWidget}
                />
                <span className="text-sm">{showWidget ? 'Visible' : 'Hidden'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={widgetPosition} onValueChange={(value: any) => setWidgetPosition(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Voice Mode</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={allowVoice}
                  onCheckedChange={setAllowVoice}
                />
                <span className="text-sm">{allowVoice ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Business Name</Label>
              <Select value={businessName} onValueChange={setBusinessName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HVAC Pro Services">HVAC Pro Services</SelectItem>
                  <SelectItem value="PlumbTech Solutions">PlumbTech Solutions</SelectItem>
                  <SelectItem value="Electric Masters">Electric Masters</SelectItem>
                  <SelectItem value="Roofing Experts">Roofing Experts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Scenarios */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Test Scenarios
            </CardTitle>
            <CardDescription>
              Try these conversation starters with the bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">New Customer</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "I need to schedule an AC repair"
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">Emergency Service</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "My heating stopped working and it's freezing"
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">Price Inquiry</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "How much does a furnace inspection cost?"
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">Appointment Change</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "I need to reschedule my appointment"
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">Human Request</p>
                <p className="text-sm text-muted-foreground mt-1">
                  "I want to speak to a real person"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Integration Code
            </CardTitle>
            <CardDescription>
              Add this to any page to show the chat widget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-xs overflow-x-auto">
{`import ChatWidget from '@/components/receptionist/chat-widget'

export default function YourPage() {
  return (
    <>
      {/* Your page content */}
      
      <ChatWidget
        businessName="${businessName}"
        position="${widgetPosition}"
        allowVoice={${allowVoice}}
        onClose={() => console.log('Chat closed')}
      />
    </>
  )
}`}
              </pre>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Props:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <code>businessName</code> - Your business name</li>
                <li>• <code>position</code> - Widget position on screen</li>
                <li>• <code>theme</code> - light, dark, or auto</li>
                <li>• <code>allowVoice</code> - Enable voice mode</li>
                <li>• <code>onClose</code> - Callback when widget closes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            n8n Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Webhook URL</p>
              <p className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'Not configured - Using fallback responses'}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Render the widget */}
      {showWidget && (
        <ChatWidget
          businessName={businessName}
          position={widgetPosition}
          allowVoice={allowVoice}
          onClose={() => setShowWidget(false)}
        />
      )}
    </div>
  )
}