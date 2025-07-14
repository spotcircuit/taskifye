'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, MessageSquare, Calendar, Star, DollarSign, 
  Users, TrendingUp, Bell, Mail, Clock, Settings,
  CheckCircle, AlertCircle
} from 'lucide-react'

interface Automation {
  id: string
  name: string
  description: string
  category: 'engagement' | 'operations' | 'marketing' | 'feedback'
  icon: any
  enabled: boolean
  config?: Record<string, any>
  stats?: {
    triggered: number
    success: number
  }
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: 'review-requests',
      name: 'Review Requests',
      description: 'Automatically request reviews after job completion',
      category: 'feedback',
      icon: Star,
      enabled: true,
      config: {
        delay: '24',
        platform: 'google',
        minJobValue: '100'
      },
      stats: {
        triggered: 156,
        success: 47
      }
    },
    {
      id: 'appointment-reminders',
      name: 'Appointment Reminders',
      description: 'Send SMS reminders before scheduled appointments',
      category: 'operations',
      icon: Calendar,
      enabled: true,
      config: {
        timing: ['24h', '2h'],
        method: 'sms'
      },
      stats: {
        triggered: 423,
        success: 418
      }
    },
    {
      id: 'estimate-followup',
      name: 'Estimate Follow-ups',
      description: 'Follow up on pending estimates automatically',
      category: 'engagement',
      icon: DollarSign,
      enabled: true,
      config: {
        stages: ['3d', '7d', '14d'],
        stopOnReply: true
      },
      stats: {
        triggered: 89,
        success: 31
      }
    },
    {
      id: 'service-reminders',
      name: 'Annual Service Reminders',
      description: 'Remind customers about annual maintenance',
      category: 'marketing',
      icon: Bell,
      enabled: false,
      config: {
        leadTime: '30',
        services: ['hvac-maintenance', 'filter-replacement']
      }
    },
    {
      id: 'winback-campaign',
      name: 'Customer Win-back',
      description: 'Re-engage customers who haven\'t used services in 6+ months',
      category: 'marketing',
      icon: Users,
      enabled: false,
      config: {
        inactivePeriod: '180',
        offerDiscount: '15'
      }
    },
    {
      id: 'weather-promotions',
      name: 'Weather-based Promotions',
      description: 'Send AC tune-up offers when temperature exceeds 85°F',
      category: 'marketing',
      icon: TrendingUp,
      enabled: false,
      config: {
        tempThreshold: '85',
        service: 'ac-tuneup'
      }
    },
    {
      id: 'birthday-greetings',
      name: 'Birthday Greetings',
      description: 'Send personalized birthday messages with special offers',
      category: 'engagement',
      icon: Mail,
      enabled: false,
      config: {
        discount: '10',
        validDays: '30'
      }
    },
    {
      id: 'job-updates',
      name: 'Real-time Job Updates',
      description: 'Notify customers when technician is on the way',
      category: 'operations',
      icon: MessageSquare,
      enabled: true,
      config: {
        etaWindow: '30',
        includePhoto: true
      },
      stats: {
        triggered: 312,
        success: 309
      }
    }
  ])

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
    ))
  }

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'engagement': return 'bg-blue-100 text-blue-800'
      case 'operations': return 'bg-green-100 text-green-800'
      case 'marketing': return 'bg-purple-100 text-purple-800'
      case 'feedback': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const categories = [
    { id: 'all', name: 'All Automations', count: automations.length },
    { id: 'engagement', name: 'Customer Engagement', count: automations.filter(a => a.category === 'engagement').length },
    { id: 'operations', name: 'Operations', count: automations.filter(a => a.category === 'operations').length },
    { id: 'marketing', name: 'Marketing', count: automations.filter(a => a.category === 'marketing').length },
    { id: 'feedback', name: 'Feedback', count: automations.filter(a => a.category === 'feedback').length },
  ]

  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredAutomations = selectedCategory === 'all' 
    ? automations 
    : automations.filter(a => a.category === selectedCategory)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-orange-500" />
            Automations
          </h1>
          <p className="text-muted-foreground mt-2">
            Simple automation rules that run in the background via n8n
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span>{automations.filter(a => a.enabled).length} Active</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {automations.filter(a => !a.enabled).length} Inactive
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Triggered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,399</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-green-600">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reviews Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">4.8★ average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.4K</div>
            <p className="text-xs text-muted-foreground">From automated campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="whitespace-nowrap"
          >
            {cat.name}
            <Badge variant="secondary" className="ml-2">
              {cat.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Automations Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredAutomations.map((automation) => (
          <Card key={automation.id} className={!automation.enabled ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${automation.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                    <automation.icon className={`h-5 w-5 ${automation.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{automation.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {automation.description}
                    </CardDescription>
                    <Badge variant="secondary" className={getCategoryColor(automation.category)}>
                      {automation.category}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={automation.enabled}
                  onCheckedChange={() => toggleAutomation(automation.id)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Configuration Options */}
              {automation.enabled && automation.config && (
                <div className="space-y-3 mb-4">
                  {automation.id === 'review-requests' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <Label>Send after (hours)</Label>
                        <Select defaultValue={automation.config.delay}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="48">48</SelectItem>
                            <SelectItem value="72">72</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Label>Platform</Label>
                        <Select defaultValue={automation.config.platform}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">Google</SelectItem>
                            <SelectItem value="yelp">Yelp</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {automation.id === 'appointment-reminders' && (
                    <div className="flex items-center justify-between text-sm">
                      <Label>Send reminders</Label>
                      <div className="flex gap-2">
                        <Badge variant="outline">24h before</Badge>
                        <Badge variant="outline">2h before</Badge>
                      </div>
                    </div>
                  )}

                  {automation.id === 'estimate-followup' && (
                    <div className="flex items-center justify-between text-sm">
                      <Label>Follow-up stages</Label>
                      <div className="flex gap-1">
                        <Badge variant="outline">3 days</Badge>
                        <Badge variant="outline">7 days</Badge>
                        <Badge variant="outline">14 days</Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              {automation.stats && (
                <div className="flex items-center justify-between pt-3 border-t text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Triggered:</span>
                      <span className="font-medium">{automation.stats.triggered}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-muted-foreground">Success:</span>
                      <span className="font-medium">{automation.stats.success}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">How Automations Work</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-900">
            These automations run through n8n workflows connected to your Pipedrive CRM and ReachInbox. 
            When you enable an automation, it will:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-blue-800">
            <li>• Monitor triggers in real-time (job completion, time-based, etc.)</li>
            <li>• Check conditions and customer preferences</li>
            <li>• Send messages via ReachInbox (SMS/Email)</li>
            <li>• Update Pipedrive with all activities</li>
            <li>• Track results and adjust timing automatically</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}