'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Phone, Bot, Mic, PhoneCall, PhoneOff, 
  Clock, Calendar, DollarSign, TrendingUp,
  Settings, PlayCircle, PauseCircle, Volume2,
  MessageSquare, AlertCircle, CheckCircle, Plus,
  Workflow, Server, Cloud, Link, ArrowRight
} from 'lucide-react'

export default function VoiceAIPage() {
  const [isActive, setIsActive] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('professional-female')
  
  const stats = [
    {
      title: 'Calls Handled Today',
      value: '47',
      subtext: '12 after hours',
      icon: Phone,
      color: 'text-blue-600',
    },
    {
      title: 'Appointments Booked',
      value: '8',
      subtext: 'Via voice AI',
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Avg Call Duration',
      value: '2:35',
      subtext: 'minutes',
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      title: 'Cost Saved',
      value: '$186',
      subtext: 'Today',
      icon: DollarSign,
      color: 'text-orange-600',
    },
  ]

  const recentCalls = [
    {
      id: 1,
      caller: '+1 (555) 123-4567',
      name: 'Sarah Johnson',
      duration: '3:24',
      time: '10 minutes ago',
      outcome: 'Appointment booked',
      status: 'success',
    },
    {
      id: 2,
      caller: '+1 (555) 987-6543',
      name: 'Unknown',
      duration: '0:45',
      time: '25 minutes ago',
      outcome: 'Service inquiry - forwarded',
      status: 'forwarded',
    },
    {
      id: 3,
      caller: '+1 (555) 456-7890',
      name: 'Mike Davis',
      duration: '2:15',
      time: '1 hour ago',
      outcome: 'Quote requested',
      status: 'success',
    },
    {
      id: 4,
      caller: '+1 (555) 234-5678',
      name: 'Linda Chen',
      duration: '1:52',
      time: '2 hours ago',
      outcome: 'Rescheduled appointment',
      status: 'success',
    },
  ]

  const businessHours = [
    { day: 'Monday', start: '8:00 AM', end: '6:00 PM', enabled: true },
    { day: 'Tuesday', start: '8:00 AM', end: '6:00 PM', enabled: true },
    { day: 'Wednesday', start: '8:00 AM', end: '6:00 PM', enabled: true },
    { day: 'Thursday', start: '8:00 AM', end: '6:00 PM', enabled: true },
    { day: 'Friday', start: '8:00 AM', end: '6:00 PM', enabled: true },
    { day: 'Saturday', start: '9:00 AM', end: '2:00 PM', enabled: true },
    { day: 'Sunday', start: 'Closed', end: 'Closed', enabled: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Voice AI Receptionist</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            AI-powered phone answering and appointment booking
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-green-600"
            />
            <Label className="font-medium text-sm sm:text-base">
              {isActive ? 'Active' : 'Inactive'}
            </Label>
          </div>
          <Button variant="outline" size="sm" className="sm:size-default">
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Configure</span>
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {isActive && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse" />
          <p className="text-sm font-medium text-green-800">
            Voice AI is actively handling incoming calls
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl min-w-[500px]">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4">Overview</TabsTrigger>
            <TabsTrigger value="architecture" className="text-xs sm:text-sm px-2 sm:px-4">Architecture</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 sm:px-4">AI Settings</TabsTrigger>
            <TabsTrigger value="scripts" className="text-xs sm:text-sm px-2 sm:px-4">Call Scripts</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent Calls */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Calls</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 rounded-lg border gap-2">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          call.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <Phone className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            call.status === 'success' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{call.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{call.caller}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm font-medium">{call.outcome}</p>
                        <p className="text-xs text-muted-foreground">{call.duration} • {call.time}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>
                  AI handles calls outside these hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {businessHours.map((hours) => (
                    <div key={hours.day} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{hours.day}</span>
                      <div className="flex items-center gap-2">
                        {hours.enabled ? (
                          <span className="text-sm text-muted-foreground">
                            {hours.start} - {hours.end}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Closed
                          </span>
                        )}
                        <Switch
                          checked={hours.enabled}
                          className="ml-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Test Voice AI
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Update Greeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Change Voice
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bot className="mr-2 h-4 w-4" />
                  Train AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>n8n Integration Architecture</CardTitle>
              <CardDescription>
                How Voice AI connects with n8n workflow automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Architecture Diagram */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="space-y-8">
                  {/* Frontend Layer */}
                  <div>
                    <h4 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wider">Frontend (UI Agent)</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="bg-background border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-5 w-5 text-blue-600" />
                          <h5 className="font-medium">Voice Interface</h5>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Capture voice input</li>
                          <li>• Stream audio to n8n</li>
                          <li>• Play AI responses</li>
                        </ul>
                      </div>
                      <div className="bg-background border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          <h5 className="font-medium">Chat Widget</h5>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Text conversations</li>
                          <li>• Quick replies</li>
                          <li>• File uploads</li>
                        </ul>
                      </div>
                      <div className="bg-background border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-5 w-5 text-purple-600" />
                          <h5 className="font-medium">Status Display</h5>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Real-time updates</li>
                          <li>• Action buttons</li>
                          <li>• Error handling</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Connection Arrow */}
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">API: /api/receptionist</span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Backend Layer */}
                  <div>
                    <h4 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wider">Backend (n8n Orchestrator)</h4>
                    <div className="bg-background border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Workflow className="h-5 w-5 text-orange-600" />
                        <h5 className="font-medium">n8n Workflow Engine</h5>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div className="p-3 bg-muted/50 rounded">
                          <h6 className="font-medium text-sm mb-1">Workflow Logic</h6>
                          <p className="text-xs text-muted-foreground">Routing, state management, business rules, persona context</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <h6 className="font-medium text-sm mb-1">LLM Integration</h6>
                          <p className="text-xs text-muted-foreground">OpenAI, Claude, or custom AI models for conversation</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <h6 className="font-medium text-sm mb-1">Intent Detection</h6>
                          <p className="text-xs text-muted-foreground">Booking, inquiry, complaint, emergency triage</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <h6 className="font-medium text-sm mb-1">Validation</h6>
                          <p className="text-xs text-muted-foreground">Phone/email validation, business hours check</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <h6 className="font-medium text-sm mb-1">Actions</h6>
                          <p className="text-xs text-muted-foreground">Book appointments, create tickets, escalate to human</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <h6 className="font-medium text-sm mb-1">Analytics</h6>
                          <p className="text-xs text-muted-foreground">Log conversations, tag outcomes, performance metrics</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integrations */}
                  <div>
                    <h4 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wider">External Integrations</h4>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="bg-background border rounded-lg p-3 text-center">
                        <Server className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <h6 className="font-medium text-sm">Pipedrive CRM</h6>
                        <p className="text-xs text-muted-foreground mt-1">Lead & contact management</p>
                      </div>
                      <div className="bg-background border rounded-lg p-3 text-center">
                        <Calendar className="h-5 w-5 mx-auto mb-1 text-green-600" />
                        <h6 className="font-medium text-sm">Calendly</h6>
                        <p className="text-xs text-muted-foreground mt-1">Appointment booking</p>
                      </div>
                      <div className="bg-background border rounded-lg p-3 text-center">
                        <MessageSquare className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                        <h6 className="font-medium text-sm">ReachInbox</h6>
                        <p className="text-xs text-muted-foreground mt-1">SMS & email follow-ups</p>
                      </div>
                      <div className="bg-background border rounded-lg p-3 text-center">
                        <Cloud className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                        <h6 className="font-medium text-sm">Google Sheets</h6>
                        <p className="text-xs text-muted-foreground mt-1">Analytics & reporting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">n8n Webhook Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <Label>n8n Webhook URL</Label>
                    <Input 
                      placeholder="https://your-n8n-instance.com/webhook/receptionist"
                      defaultValue={process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure this in your .env.local file as N8N_RECEPTIONIST_WEBHOOK_URL
                    </p>
                  </div>
                  <div>
                    <Label>n8n API Key (Optional)</Label>
                    <Input 
                      type="password"
                      placeholder="Your n8n API key for authentication"
                    />
                  </div>
                </div>
              </div>

              {/* Response Structure */}
              <div className="space-y-4">
                <h3 className="font-medium">API Response Structure</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto">
{`{
  "sessionId": "unique-session-id",
  "message": "AI response text",
  "status": "success | error | escalate | ended",
  "actions": [
    {
      "type": "book_appointment",
      "label": "Book Now",
      "data": { ... }
    }
  ],
  "audioUrl": "optional-audio-response.mp3",
  "metadata": {
    "intent": "booking",
    "sentiment": "positive"
  }
}`}
                  </pre>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Link className="mr-2 h-4 w-4" />
                Test n8n Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice AI Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>AI Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional-female">Professional Female</SelectItem>
                    <SelectItem value="professional-male">Professional Male</SelectItem>
                    <SelectItem value="friendly-female">Friendly Female</SelectItem>
                    <SelectItem value="friendly-male">Friendly Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input defaultValue="HVAC Pro Services" />
              </div>

              <div className="space-y-2">
                <Label>Primary Greeting</Label>
                <textarea 
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  defaultValue="Thank you for calling HVAC Pro Services. How can I help you today?"
                />
              </div>

              <div className="space-y-2">
                <Label>After Hours Message</Label>
                <textarea 
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  defaultValue="Thank you for calling HVAC Pro Services. Our office is currently closed. I can help you schedule an appointment or take a message."
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Call Handling Rules</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Allow appointment booking</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Collect caller information</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Offer emergency service</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Forward to human when requested</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Scripts & Responses</CardTitle>
              <CardDescription>
                Train your AI with common scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    scenario: 'New Customer Inquiry',
                    trigger: 'I need HVAC service',
                    response: 'I\'d be happy to help you with that. Can you tell me what type of service you need? Are you experiencing an issue with heating, cooling, or would you like to schedule maintenance?',
                  },
                  {
                    scenario: 'Emergency Service',
                    trigger: 'My AC is not working',
                    response: 'I understand this is urgent. We offer emergency service. Let me check our next available technician. Can you provide your address and the best phone number to reach you?',
                  },
                  {
                    scenario: 'Price Inquiry',
                    trigger: 'How much does it cost',
                    response: 'Our pricing depends on the specific service needed. For a detailed quote, I can schedule a free consultation. Most diagnostic visits are $89, which is waived if you proceed with repairs.',
                  },
                  {
                    scenario: 'Appointment Booking',
                    trigger: 'I want to schedule',
                    response: 'I\'d be happy to schedule an appointment for you. What day works best? We have availability Monday through Saturday.',
                  },
                ].map((script) => (
                  <div key={script.scenario} className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-medium">{script.scenario}</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Trigger:</span> "{script.trigger}"
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Response:</span> {script.response}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Test</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add New Script
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Call Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">92%</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-[92%] h-full bg-green-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Human Handoff Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">15%</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-[15%] h-full bg-blue-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Appointment Conversion</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">68%</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-[68%] h-full bg-purple-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-green-600">$5,480</p>
                    <p className="text-sm text-muted-foreground mt-1">Saved this month</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Calls handled by AI</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg cost per AI call</span>
                      <span className="font-medium">$0.12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Human operator cost avoided</span>
                      <span className="font-medium">$5,629</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}