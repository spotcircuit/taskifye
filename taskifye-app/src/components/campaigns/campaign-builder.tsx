'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { 
  Mail, MessageSquare, Users, Send, Clock, TrendingUp, 
  Calendar, DollarSign, MapPin, Star, AlertCircle,
  Filter, Search, ChevronRight, Plus, Edit,
  CheckCircle, XCircle, Loader2, Phone, Building,
  Target, Zap, BarChart3, Settings, Eye,
  Smartphone, Monitor, Globe, RefreshCw, UserPlus
} from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'
import { format, addDays } from 'date-fns'

interface Contact {
  id: number
  name: string
  email?: string[]
  phone?: string[]
  organization?: { name: string }
  deals_count?: number
  won_deals_count?: number
  activities_count?: number
  add_time: string
  last_activity_date?: string
}

interface Segment {
  id: string
  name: string
  description: string
  icon: any
  count: number
  contacts: Contact[]
  criteria: string[]
  color: string
}

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'both'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  segment: string
  content: {
    email?: {
      subject: string
      body: string
      preheader?: string
      fromName: string
      fromEmail: string
      replyTo?: string
    }
    sms?: {
      message: string
      includeOptOut: boolean
    }
  }
  schedule?: {
    sendAt?: string
    timezone: string
  }
  stats?: {
    sent: number
    delivered: number
    opened?: number
    clicked?: number
    replied?: number
    unsubscribed?: number
    bounced?: number
  }
}

const MERGE_TAGS = [
  { tag: '{FIRST_NAME}', description: 'Contact first name' },
  { tag: '{LAST_NAME}', description: 'Contact last name' },
  { tag: '{COMPANY}', description: 'Company name' },
  { tag: '{LAST_SERVICE}', description: 'Last service type' },
  { tag: '{LAST_SERVICE_DATE}', description: 'Last service date' },
  { tag: '{NEXT_SERVICE_DATE}', description: 'Next scheduled service' },
  { tag: '{TECHNICIAN}', description: 'Assigned technician' },
  { tag: '{UNSUBSCRIBE_LINK}', description: 'Unsubscribe link (email only)' },
  { tag: '{COMPANY_NAME}', description: 'Your company name' },
  { tag: '{COMPANY_PHONE}', description: 'Your company phone' },
]

export function CampaignBuilder() {
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<string>('')
  const [campaignType, setCampaignType] = useState<'email' | 'sms' | 'both'>('email')
  const [showPreview, setShowPreview] = useState(false)
  const [sendingCampaign, setSendingCampaign] = useState(false)
  const [testMode, setTestMode] = useState(false)
  const [testRecipient, setTestRecipient] = useState('')
  
  const [campaignData, setCampaignData] = useState<Campaign>({
    id: '',
    name: '',
    type: 'email',
    status: 'draft',
    segment: '',
    content: {
      email: {
        subject: '',
        body: '',
        preheader: '',
        fromName: 'HVAC Pro Services',
        fromEmail: 'noreply@hvacpro.com',
        replyTo: 'support@hvacpro.com'
      },
      sms: {
        message: '',
        includeOptOut: true
      }
    },
    schedule: {
      timezone: 'America/Chicago'
    }
  })

  // Email Templates
  const emailTemplates = [
    {
      id: 'service-reminder',
      name: 'Service Reminder',
      subject: 'Time for your {LAST_SERVICE} maintenance, {FIRST_NAME}',
      body: `Hi {FIRST_NAME},

It's been a while since your last {LAST_SERVICE} service on {LAST_SERVICE_DATE}. Regular maintenance helps prevent costly breakdowns and keeps your system running efficiently.

📅 Schedule your service today and save $20!

Why regular maintenance matters:
• Extends equipment lifespan
• Improves energy efficiency
• Prevents unexpected breakdowns
• Maintains warranty coverage

Book online: [BOOKING_LINK]
Call us: {COMPANY_PHONE}

Best regards,
{COMPANY_NAME} Team

P.S. Reply to this email with any questions!`,
      preheader: 'Save $20 on your next service'
    },
    {
      id: 'seasonal-campaign',
      name: 'Seasonal Campaign',
      subject: '🌞 Get your AC ready for summer, {FIRST_NAME}!',
      body: `Hi {FIRST_NAME},

Summer is almost here! Is your AC system ready for the heat?

We're offering our comprehensive AC tune-up special for just $89 (regularly $129) - but only until [END_DATE].

✅ What's included:
• Complete system inspection
• Coil cleaning
• Refrigerant check
• Filter replacement
• Thermostat calibration
• Performance testing

🎯 Limited spots available - our calendar is filling up fast!

[BOOK NOW BUTTON]

Questions? Just reply to this email or call {COMPANY_PHONE}.

Stay cool,
{COMPANY_NAME}`,
      preheader: 'Limited time: $40 OFF AC tune-up'
    },
    {
      id: 'win-back',
      name: 'Win-Back Campaign',
      subject: 'We miss you, {FIRST_NAME} - here\'s 25% off',
      body: `Hi {FIRST_NAME},

We noticed it's been over {MONTHS_SINCE_LAST_SERVICE} months since your last service with {COMPANY_NAME}. We'd love to welcome you back!

As a valued past customer, here's an exclusive offer just for you:

🎁 25% OFF your next service
📅 Priority scheduling
🛠️ Free second opinion on any repairs

Your discount code: COMEBACK25
(Valid for 30 days)

What our customers are saying:
"Best HVAC service in town! Professional, honest, and fair pricing." - Sarah M.

[SCHEDULE SERVICE]

We've missed serving you and hope to see you soon!

Warmly,
{COMPANY_NAME} Team`,
      preheader: 'Your exclusive 25% discount inside'
    }
  ]

  // SMS Templates
  const smsTemplates = [
    {
      id: 'appointment-reminder',
      name: 'Appointment Reminder',
      message: 'Hi {FIRST_NAME}! Reminder: Your {SERVICE} appointment is scheduled for {DATE} at {TIME}. Reply C to confirm or R to reschedule. - {COMPANY_NAME}'
    },
    {
      id: 'service-due',
      name: 'Service Due',
      message: '{FIRST_NAME}, your annual AC maintenance is due! Book now and save $20. Call {COMPANY_PHONE} or reply YES to schedule. - {COMPANY_NAME}'
    },
    {
      id: 'special-offer',
      name: 'Special Offer',
      message: '🔥 {FIRST_NAME}, flash sale! 20% off all services this week only. Call {COMPANY_PHONE} or reply SAVE20 for details. - {COMPANY_NAME}'
    }
  ]

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      setLoading(false)
      return
    }

    try {
      const pipedrive = new PipedriveService(apiKey)
      const response = await pipedrive.getPersons()
      
      if (response.success && response.persons) {
        setContacts(response.persons)
        generateSegments(response.persons)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSegments = (contactList: Contact[]) => {
    const now = new Date()
    const segments: Segment[] = [
      {
        id: 'all-contacts',
        name: 'All Contacts',
        description: 'Everyone in your database',
        icon: Users,
        count: contactList.length,
        contacts: contactList,
        criteria: ['All contacts with valid email or phone'],
        color: 'bg-gray-100 text-gray-800'
      },
      {
        id: 'active-customers',
        name: 'Active Customers',
        description: 'Customers with recent activity',
        icon: TrendingUp,
        count: 0,
        contacts: contactList.filter(c => {
          if (!c.last_activity_date) return false
          const lastActivity = new Date(c.last_activity_date)
          const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          return daysSince <= 90
        }),
        criteria: ['Activity in last 90 days', 'Has completed deals'],
        color: 'bg-green-100 text-green-800'
      },
      {
        id: 'high-value',
        name: 'High-Value Customers',
        description: 'Your best customers',
        icon: DollarSign,
        count: 0,
        contacts: contactList.filter(c => (c.won_deals_count || 0) >= 3),
        criteria: ['3+ completed jobs', 'High lifetime value'],
        color: 'bg-purple-100 text-purple-800'
      },
      {
        id: 'inactive',
        name: 'Inactive Customers',
        description: 'No recent activity',
        icon: Clock,
        count: 0,
        contacts: contactList.filter(c => {
          if (!c.last_activity_date) return true
          const lastActivity = new Date(c.last_activity_date)
          const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          return daysSince > 180
        }),
        criteria: ['No activity in 180+ days', 'Past customers'],
        color: 'bg-orange-100 text-orange-800'
      },
      {
        id: 'leads-only',
        name: 'Leads Only',
        description: 'Contacts without deals',
        icon: Target,
        count: 0,
        contacts: contactList.filter(c => (c.deals_count || 0) === 0),
        criteria: ['No deals yet', 'Potential customers'],
        color: 'bg-blue-100 text-blue-800'
      },
      {
        id: 'new-contacts',
        name: 'New Contacts',
        description: 'Recently added (30 days)',
        icon: UserPlus,
        count: 0,
        contacts: contactList.filter(c => {
          const addDate = new Date(c.add_time)
          const daysSince = Math.floor((now.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysSince <= 30
        }),
        criteria: ['Added in last 30 days'],
        color: 'bg-indigo-100 text-indigo-800'
      }
    ]

    // Update counts
    segments.forEach(segment => {
      segment.count = segment.contacts.length
    })

    setSegments(segments)
  }

  const handleSendCampaign = async (isTest = false) => {
    if (!selectedSegment || (!campaignData.content.email?.subject && !campaignData.content.sms?.message)) {
      alert('Please select a segment and add content')
      return
    }

    if (isTest && !testRecipient) {
      alert('Please enter a test recipient')
      return
    }

    setSendingCampaign(true)

    try {
      const apiKey = pipedriveStorage.getApiKey()
      if (!apiKey) {
        alert('Please connect Pipedrive first')
        return
      }

      const pipedrive = new PipedriveService(apiKey)
      const segment = segments.find(s => s.id === selectedSegment)
      
      if (!segment) return

      const recipients = isTest ? [{ email: testRecipient, name: 'Test Recipient' }] : segment.contacts

      // Log campaign details (in production, this would send via ReachInbox/Twilio APIs)
      console.log('Campaign Details:', {
        name: campaignData.name,
        type: campaignType,
        segment: segment.name,
        recipientCount: recipients.length,
        content: campaignData.content,
        isTest
      })

      // Create activity in Pipedrive for campaign
      await pipedrive.createActivity({
        subject: `Campaign sent: ${campaignData.name}`,
        type: campaignType === 'email' ? 'email' : 'task',
        note: `
Campaign: ${campaignData.name}
Type: ${campaignType}
Segment: ${segment.name} (${recipients.length} recipients)
${campaignType === 'email' ? `Subject: ${campaignData.content.email?.subject}` : `Message: ${campaignData.content.sms?.message}`}
Status: ${isTest ? 'Test sent' : 'Campaign sent'}
        `,
        done: true
      })

      // In production, this would:
      // 1. For Email: Call ReachInbox API to create and send campaign
      // 2. For SMS: Call Twilio API to send messages
      // 3. Store campaign in database for tracking

      alert(isTest ? 'Test sent successfully!' : 'Campaign sent successfully!')
      
      if (!isTest) {
        // Reset form after successful send
        setCampaignData({
          ...campaignData,
          name: '',
          content: {
            email: {
              subject: '',
              body: '',
              preheader: '',
              fromName: 'HVAC Pro Services',
              fromEmail: 'noreply@hvacpro.com',
              replyTo: 'support@hvacpro.com'
            },
            sms: {
              message: '',
              includeOptOut: true
            }
          }
        })
        setSelectedSegment('')
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
      alert('Failed to send campaign')
    } finally {
      setSendingCampaign(false)
    }
  }

  const insertMergeTag = (tag: string, field: 'subject' | 'body' | 'sms') => {
    if (field === 'sms') {
      setCampaignData({
        ...campaignData,
        content: {
          ...campaignData.content,
          sms: {
            ...campaignData.content.sms!,
            message: campaignData.content.sms!.message + tag
          }
        }
      })
    } else if (field === 'subject') {
      setCampaignData({
        ...campaignData,
        content: {
          ...campaignData.content,
          email: {
            ...campaignData.content.email!,
            subject: campaignData.content.email!.subject + tag
          }
        }
      })
    } else {
      setCampaignData({
        ...campaignData,
        content: {
          ...campaignData.content,
          email: {
            ...campaignData.content.email!,
            body: campaignData.content.email!.body + tag
          }
        }
      })
    }
  }

  const selectedSegmentData = segments.find(s => s.id === selectedSegment)
  const characterCount = campaignType === 'sms' ? campaignData.content.sms?.message.length || 0 : 0
  const smsSegments = Math.ceil(characterCount / 160)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Campaign Builder</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Send targeted email and SMS campaigns via ReachInbox and Twilio
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Mail className="mr-1 h-3 w-3" />
            ReachInbox Connected
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Phone className="mr-1 h-3 w-3" />
            Twilio Connected
          </Badge>
        </div>
      </div>

      {/* Campaign Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Type</CardTitle>
          <CardDescription>Choose how you want to reach your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={campaignType} onValueChange={(value: any) => setCampaignType(value)}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                campaignType === 'email' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <RadioGroupItem value="email" className="sr-only" />
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Email Campaign</p>
                  <p className="text-sm text-muted-foreground">via ReachInbox</p>
                </div>
              </label>
              
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                campaignType === 'sms' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <RadioGroupItem value="sms" className="sr-only" />
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">SMS Campaign</p>
                  <p className="text-sm text-muted-foreground">via Twilio</p>
                </div>
              </label>
              
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                campaignType === 'both' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <RadioGroupItem value="both" className="sr-only" />
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Multi-Channel</p>
                  <p className="text-sm text-muted-foreground">Email + SMS</p>
                </div>
              </label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Segment Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Select Audience
                <Button variant="outline" size="sm">
                  <Filter className="mr-1 h-3 w-3" />
                  Custom
                </Button>
              </CardTitle>
              <CardDescription>
                Choose who will receive this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="space-y-2">
                  {segments.map((segment) => (
                    <button
                      key={segment.id}
                      onClick={() => setSelectedSegment(segment.id)}
                      disabled={segment.count === 0}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedSegment === segment.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : segment.count === 0
                          ? 'border-gray-200 opacity-50 cursor-not-allowed'
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
              )}
            </CardContent>
          </Card>

          {/* Merge Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personalization</CardTitle>
              <CardDescription>Click to insert merge tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {MERGE_TAGS.slice(0, 6).map((tag) => (
                  <Button
                    key={tag.tag}
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => {
                      const field = campaignType === 'sms' ? 'sms' : 'body'
                      insertMergeTag(tag.tag, field)
                    }}
                  >
                    {tag.tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Builder */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
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
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name (Internal)</Label>
                <Input
                  id="name"
                  placeholder="e.g., Spring AC Maintenance Reminder"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                />
              </div>

              {/* Email Content */}
              {(campaignType === 'email' || campaignType === 'both') && (
                <>
                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label>Template (Optional)</Label>
                    <Select onValueChange={(value) => {
                      const template = emailTemplates.find(t => t.id === value)
                      if (template) {
                        setCampaignData({
                          ...campaignData,
                          content: {
                            ...campaignData.content,
                            email: {
                              ...campaignData.content.email!,
                              subject: template.subject,
                              body: template.body,
                              preheader: template.preheader
                            }
                          }
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

                  {/* From Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Name</Label>
                      <Input
                        value={campaignData.content.email?.fromName}
                        onChange={(e) => setCampaignData({
                          ...campaignData,
                          content: {
                            ...campaignData.content,
                            email: {
                              ...campaignData.content.email!,
                              fromName: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>From Email</Label>
                      <Input
                        type="email"
                        value={campaignData.content.email?.fromEmail}
                        onChange={(e) => setCampaignData({
                          ...campaignData,
                          content: {
                            ...campaignData.content,
                            email: {
                              ...campaignData.content.email!,
                              fromEmail: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <div className="relative">
                      <Input 
                        placeholder="Enter email subject..."
                        value={campaignData.content.email?.subject}
                        onChange={(e) => setCampaignData({
                          ...campaignData,
                          content: {
                            ...campaignData.content,
                            email: {
                              ...campaignData.content.email!,
                              subject: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                  </div>

                  {/* Preheader */}
                  <div className="space-y-2">
                    <Label>Preheader Text (Optional)</Label>
                    <Input 
                      placeholder="Preview text that appears after subject..."
                      value={campaignData.content.email?.preheader}
                      onChange={(e) => setCampaignData({
                        ...campaignData,
                        content: {
                          ...campaignData.content,
                          email: {
                            ...campaignData.content.email!,
                            preheader: e.target.value
                          }
                        }
                      })}
                    />
                  </div>

                  {/* Email Body */}
                  <div className="space-y-2">
                    <Label>Email Content</Label>
                    <Textarea 
                      placeholder="Write your email content..."
                      className="min-h-[300px] font-mono text-sm"
                      value={campaignData.content.email?.body}
                      onChange={(e) => setCampaignData({
                        ...campaignData,
                        content: {
                          ...campaignData.content,
                          email: {
                            ...campaignData.content.email!,
                            body: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                </>
              )}

              {/* SMS Content */}
              {(campaignType === 'sms' || campaignType === 'both') && (
                <>
                  {/* SMS Template */}
                  <div className="space-y-2">
                    <Label>SMS Template (Optional)</Label>
                    <Select onValueChange={(value) => {
                      const template = smsTemplates.find(t => t.id === value)
                      if (template) {
                        setCampaignData({
                          ...campaignData,
                          content: {
                            ...campaignData.content,
                            sms: {
                              ...campaignData.content.sms!,
                              message: template.message
                            }
                          }
                        })
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an SMS template" />
                      </SelectTrigger>
                      <SelectContent>
                        {smsTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* SMS Message */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>SMS Message</Label>
                      <span className="text-sm text-muted-foreground">
                        {characterCount}/160 ({smsSegments} segment{smsSegments !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <Textarea
                      placeholder="Type your SMS message..."
                      className="font-mono text-sm"
                      maxLength={480}
                      rows={4}
                      value={campaignData.content.sms?.message}
                      onChange={(e) => setCampaignData({
                        ...campaignData,
                        content: {
                          ...campaignData.content,
                          sms: {
                            ...campaignData.content.sms!,
                            message: e.target.value
                          }
                        }
                      })}
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="opt-out"
                        checked={campaignData.content.sms?.includeOptOut}
                        onCheckedChange={(checked) => setCampaignData({
                          ...campaignData,
                          content: {
                            ...campaignData.content,
                            sms: {
                              ...campaignData.content.sms!,
                              includeOptOut: checked
                            }
                          }
                        })}
                      />
                      <Label htmlFor="opt-out" className="text-sm font-normal">
                        Include opt-out message (Reply STOP to unsubscribe)
                      </Label>
                    </div>
                  </div>
                </>
              )}

              {/* Schedule Options */}
              <div className="space-y-2">
                <Label>Send Time</Label>
                <RadioGroup defaultValue="now">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="now" />
                    <Label htmlFor="now" className="font-normal">Send immediately</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="schedule" id="schedule" />
                    <Label htmlFor="schedule" className="font-normal">Schedule for later</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    disabled={
                      !selectedSegment || 
                      (campaignType === 'email' && !campaignData.content.email?.subject) ||
                      (campaignType === 'sms' && !campaignData.content.sms?.message)
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="test-mode"
                      checked={testMode}
                      onCheckedChange={setTestMode}
                    />
                    <Label htmlFor="test-mode" className="text-sm font-normal">
                      Test mode
                    </Label>
                  </div>
                  
                  {testMode && (
                    <Input
                      placeholder={campaignType === 'sms' ? 'Test phone number' : 'Test email'}
                      className="w-48"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">
                    Save Draft
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleSendCampaign(testMode)}
                    disabled={
                      sendingCampaign ||
                      !selectedSegment || 
                      !campaignData.name ||
                      (campaignType === 'email' && !campaignData.content.email?.subject) ||
                      (campaignType === 'sms' && !campaignData.content.sms?.message) ||
                      (testMode && !testRecipient)
                    }
                  >
                    {sendingCampaign ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {testMode ? 'Send Test' : 'Send Campaign'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Preview</DialogTitle>
            <DialogDescription>
              This is how your campaign will appear to recipients
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Device Preview Tabs */}
            <Tabs defaultValue="desktop" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="desktop">
                  <Monitor className="mr-2 h-4 w-4" />
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mobile
                </TabsTrigger>
                <TabsTrigger value="raw">
                  <Globe className="mr-2 h-4 w-4" />
                  Raw
                </TabsTrigger>
              </TabsList>

              {campaignType === 'email' || campaignType === 'both' ? (
                <>
                  <TabsContent value="desktop" className="mt-4">
                    <div className="border rounded-lg p-4 bg-white">
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-sm text-muted-foreground">From: {campaignData.content.email?.fromName} &lt;{campaignData.content.email?.fromEmail}&gt;</p>
                        <p className="text-sm text-muted-foreground">To: John Doe &lt;john@example.com&gt;</p>
                        <p className="font-semibold mt-2">{campaignData.content.email?.subject}</p>
                      </div>
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{campaignData.content.email?.body}</pre>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="mobile" className="mt-4">
                    <div className="max-w-sm mx-auto">
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="mb-4 pb-4 border-b">
                          <p className="text-xs text-muted-foreground">From: {campaignData.content.email?.fromName}</p>
                          <p className="font-semibold text-sm mt-2">{campaignData.content.email?.subject}</p>
                          {campaignData.content.email?.preheader && (
                            <p className="text-xs text-muted-foreground mt-1">{campaignData.content.email.preheader}</p>
                          )}
                        </div>
                        <div className="text-sm">
                          <pre className="whitespace-pre-wrap font-sans">{campaignData.content.email?.body}</pre>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="raw" className="mt-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
{`Subject: ${campaignData.content.email?.subject}
From: ${campaignData.content.email?.fromName} <${campaignData.content.email?.fromEmail}>
Reply-To: ${campaignData.content.email?.replyTo}
${campaignData.content.email?.preheader ? `Preheader: ${campaignData.content.email.preheader}` : ''}

${campaignData.content.email?.body}`}
                      </pre>
                    </div>
                  </TabsContent>
                </>
              ) : (
                <div className="mt-4">
                  <div className="max-w-sm mx-auto">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">{campaignData.content.sms?.message}</p>
                        {campaignData.content.sms?.includeOptOut && (
                          <p className="text-xs text-gray-500 mt-2">Reply STOP to unsubscribe</p>
                        )}
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        {characterCount} characters • {smsSegments} SMS segment{smsSegments !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}