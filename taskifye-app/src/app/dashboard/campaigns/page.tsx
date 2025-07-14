'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mail, Users, Send, Clock, TrendingUp, 
  Calendar, DollarSign, MapPin, Star, AlertCircle,
  Filter, Search, ChevronRight, Plus, Edit,
  CheckCircle, XCircle, Loader2
} from 'lucide-react'

interface Segment {
  id: string
  name: string
  description: string
  icon: any
  count: number
  criteria: string[]
  color: string
}

interface Campaign {
  id: string
  name: string
  status: 'draft' | 'sending' | 'sent' | 'scheduled'
  type: 'email' | 'sms'
  segment: string
  sentDate?: string
  scheduledDate?: string
  stats?: {
    sent: number
    opened: number
    clicked: number
    replied: number
  }
}

export default function CampaignsPage() {
  const [selectedSegment, setSelectedSegment] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: '',
    sendAs: 'company'
  })

  const segments: Segment[] = [
    {
      id: 'recent-customers',
      name: 'Recent Customers',
      description: 'Customers with jobs in the last 30 days',
      icon: Clock,
      count: 127,
      criteria: ['Job completed in last 30 days', 'Payment received'],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'high-value',
      name: 'High-Value Customers',
      description: 'Customers with $1,000+ lifetime value',
      icon: DollarSign,
      count: 84,
      criteria: ['Total spend > $1,000', 'Multiple jobs completed'],
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'inactive',
      name: 'Inactive Customers',
      description: 'No service in the last 6 months',
      icon: Users,
      count: 213,
      criteria: ['Last job > 180 days ago', 'Previous customer'],
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'service-due',
      name: 'Service Due',
      description: 'Annual maintenance due in next 30 days',
      icon: Calendar,
      count: 56,
      criteria: ['Annual service customer', 'Due date within 30 days'],
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'emergency-customers',
      name: 'Emergency Service Users',
      description: 'Customers who\'ve used emergency service',
      icon: AlertCircle,
      count: 42,
      criteria: ['Used emergency service', 'High priority customers'],
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'seasonal-ac',
      name: 'AC Service (Seasonal)',
      description: 'Customers with AC units for summer prep',
      icon: TrendingUp,
      count: 298,
      criteria: ['Has AC unit', 'Service history includes cooling'],
      color: 'bg-cyan-100 text-cyan-800'
    },
    {
      id: 'geographic-north',
      name: 'North Region',
      description: 'Customers in north service area',
      icon: MapPin,
      count: 165,
      criteria: ['ZIP codes: 75201-75210', 'Within 15 miles'],
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'five-star',
      name: '5-Star Reviewers',
      description: 'Customers who left 5-star reviews',
      icon: Star,
      count: 93,
      criteria: ['Left 5-star review', 'Positive feedback'],
      color: 'bg-yellow-100 text-yellow-800'
    }
  ]

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Spring AC Tune-up Special',
      status: 'sent',
      type: 'email',
      segment: 'seasonal-ac',
      sentDate: '2024-03-15',
      stats: {
        sent: 298,
        opened: 187,
        clicked: 43,
        replied: 12
      }
    },
    {
      id: '2',
      name: 'Service Reminder - March',
      status: 'sending',
      type: 'email',
      segment: 'service-due',
      stats: {
        sent: 34,
        opened: 12,
        clicked: 3,
        replied: 1
      }
    },
    {
      id: '3',
      name: 'We Miss You - 20% Off',
      status: 'scheduled',
      type: 'email',
      segment: 'inactive',
      scheduledDate: '2024-04-01'
    }
  ]

  const emailTemplates = [
    {
      id: 'service-reminder',
      name: 'Service Reminder',
      subject: 'Time for your annual {SERVICE} maintenance',
      body: `Hi {FIRST_NAME},

It's been a year since your last {SERVICE} maintenance. Regular maintenance helps prevent breakdowns and keeps your system running efficiently.

Schedule your appointment today and save $20 off your service.

Best regards,
{COMPANY_NAME}`
    },
    {
      id: 'seasonal-offer',
      name: 'Seasonal Offer',
      subject: 'Get your {SYSTEM} ready for {SEASON}',
      body: `Hi {FIRST_NAME},

{SEASON} is coming! Is your {SYSTEM} ready?

We're offering a special tune-up service for just $89 (regularly $129) this month only.

Benefits include:
• Complete system inspection
• Filter replacement
• Performance optimization
• Priority service status

Book now: {BOOKING_LINK}

{COMPANY_NAME}`
    },
    {
      id: 'win-back',
      name: 'Win-back Campaign',
      subject: 'We miss you at {COMPANY_NAME}',
      body: `Hi {FIRST_NAME},

We noticed it's been a while since your last service with us. We'd love to have you back!

As a valued past customer, we're offering you an exclusive 20% discount on your next service.

Use code: COMEBACK20

This offer expires in 30 days. We hope to see you soon!

{COMPANY_NAME}`
    }
  ]

  const handleSendCampaign = () => {
    if (!selectedSegment || !emailContent.subject || !emailContent.body) {
      alert('Please select a segment and fill in email content')
      return
    }
    
    // In real app, this would send via API
    console.log('Sending campaign:', {
      segment: selectedSegment,
      content: emailContent
    })
  }

  const selectedSegmentData = segments.find(s => s.id === selectedSegment)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Send targeted emails to customer segments via ReachInbox
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Segment Selection */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Audience</CardTitle>
                  <CardDescription>
                    Choose a customer segment to target
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {segments.slice(0, 5).map((segment) => (
                      <button
                        key={segment.id}
                        onClick={() => setSelectedSegment(segment.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          selectedSegment === segment.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <segment.icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{segment.name}</span>
                          </div>
                          <Badge variant="secondary" className={segment.color}>
                            {segment.count}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {segment.description}
                        </p>
                      </button>
                    ))}
                  </div>
                  <Button variant="link" className="w-full mt-2" size="sm">
                    View all segments
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Search className="mr-2 h-4 w-4" />
                    Search specific customer
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Create custom filter
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Email Composer */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compose Email</CardTitle>
                  {selectedSegmentData && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Sending to:</span>
                      <Badge className={selectedSegmentData.color}>
                        {selectedSegmentData.name} ({selectedSegmentData.count} contacts)
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label>Template (Optional)</Label>
                    <Select onValueChange={(value) => {
                      const template = emailTemplates.find(t => t.id === value)
                      if (template) {
                        setEmailContent({
                          ...emailContent,
                          subject: template.subject,
                          body: template.body
                        })
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template or start from scratch" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Send As */}
                  <div className="space-y-2">
                    <Label>Send As</Label>
                    <Select value={emailContent.sendAs} onValueChange={(value) => 
                      setEmailContent({...emailContent, sendAs: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">HVAC Pro Services (company@email.com)</SelectItem>
                        <SelectItem value="personal">John Smith (john@hvacpro.com)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input 
                      placeholder="Enter email subject..."
                      value={emailContent.subject}
                      onChange={(e) => setEmailContent({...emailContent, subject: e.target.value})}
                    />
                  </div>

                  {/* Body */}
                  <div className="space-y-2">
                    <Label>Email Content</Label>
                    <Textarea 
                      placeholder="Write your email content..."
                      className="min-h-[300px] font-mono text-sm"
                      value={emailContent.body}
                      onChange={(e) => setEmailContent({...emailContent, body: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available variables: {'{FIRST_NAME}'}, {'{LAST_NAME}'}, {'{COMPANY_NAME}'}, {'{SERVICE}'}, {'{LAST_SERVICE_DATE}'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex gap-2">
                      <Button variant="outline">
                        Save Draft
                      </Button>
                      <Button variant="outline">
                        Preview
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        Schedule
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleSendCampaign}
                        disabled={!selectedSegment || !emailContent.subject || !emailContent.body}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Campaign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <segment.icon className="h-5 w-5" />
                      <CardTitle className="text-base">{segment.name}</CardTitle>
                    </div>
                    <Badge className={segment.color}>
                      {segment.count}
                    </Badge>
                  </div>
                  <CardDescription>{segment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Criteria:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {segment.criteria.map((criterion, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" />
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="mr-1 h-3 w-3" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>
                Track performance of your email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge variant={
                            campaign.status === 'sent' ? 'default' :
                            campaign.status === 'sending' ? 'secondary' :
                            campaign.status === 'scheduled' ? 'outline' : 'destructive'
                          }>
                            {campaign.status === 'sending' && (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            )}
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Segment: {segments.find(s => s.id === campaign.segment)?.name}
                          {campaign.sentDate && ` • Sent ${campaign.sentDate}`}
                          {campaign.scheduledDate && ` • Scheduled for ${campaign.scheduledDate}`}
                        </p>
                      </div>
                      
                      {campaign.stats && (
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{campaign.stats.sent}</p>
                            <p className="text-xs text-muted-foreground">Sent</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-green-600">
                              {((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Opened</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-blue-600">
                              {((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Clicked</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{campaign.stats.replied}</p>
                            <p className="text-xs text-muted-foreground">Replied</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}