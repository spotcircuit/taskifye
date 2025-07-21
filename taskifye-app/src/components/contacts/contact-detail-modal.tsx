'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Phone, Mail, Building, MapPin, Calendar, Clock, 
  DollarSign, FileText, Activity, User, Edit, 
  MessageSquare, CheckCircle, AlertCircle, TrendingUp,
  ExternalLink, Wrench, Star
} from 'lucide-react'
import { format, formatDistance } from 'date-fns'
import { PipedriveService } from '@/lib/integrations/pipedrive'

interface ContactDetailModalProps {
  contact: any
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
}

interface Deal {
  id: number
  title: string
  value: number
  currency: string
  stage_id: number
  status: string
  add_time: string
  update_time: string
  won_time?: string
  lost_time?: string
  close_time?: string
  expected_close_date?: string
  probability?: number
}

interface Activity {
  id: number
  type: string
  subject: string
  done: boolean
  due_date?: string
  add_time: string
  marked_as_done_time?: string
}

export function ContactDetailModal({ contact, isOpen, onClose, onEdit }: ContactDetailModalProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isOpen && contact) {
      fetchContactDetails()
    }
  }, [isOpen, contact])

  const fetchContactDetails = async () => {
    const apiKey = null // API key now comes from database
    if (!apiKey) {
      setLoading(false)
      return
    }

    try {
      const pipedrive = new PipedriveService()
      
      // Fetch deals for this contact
      const dealsResponse = await pipedrive.getDeals({ person_id: contact.id })
      if (dealsResponse.success && dealsResponse.deals) {
        setDeals(dealsResponse.deals)
      }

      // Fetch activities for this contact
      const activitiesResponse = await pipedrive.getActivities({ person_id: contact.id })
      if (activitiesResponse.success && activitiesResponse.data) {
        setActivities(activitiesResponse.data)
      }

      // TODO: Fetch notes when API supports it
      // const notesResponse = await pipedrive.getNotes('person', contact.id)
      
    } catch (error) {
      console.error('Error fetching contact details:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    const wonDeals = deals.filter(d => d.status === 'won')
    const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    const avgDealValue = deals.length > 0 ? totalValue / deals.length : 0
    const winRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0

    return {
      totalDeals: deals.length,
      wonDeals: wonDeals.length,
      totalValue,
      wonValue,
      avgDealValue,
      winRate
    }
  }

  const stats = calculateStats()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone
      case 'meeting': return Calendar
      case 'email': return Mail
      case 'task': return CheckCircle
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'text-blue-600'
      case 'meeting': return 'text-green-600'
      case 'email': return 'text-purple-600'
      case 'task': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{contact?.name}</DialogTitle>
              <DialogDescription className="mt-2">
                <div className="flex items-center gap-4">
                  {contact?.email?.[0] && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{typeof contact.email[0] === 'string' ? contact.email[0] : contact.email[0]?.value}</span>
                    </div>
                  )}
                  {contact?.phone?.[0] && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{typeof contact.phone[0] === 'string' ? contact.phone[0] : contact.phone[0]?.value}</span>
                    </div>
                  )}
                  {contact?.organization && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{contact.organization.name}</span>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1 h-4 w-4" />
                Pipedrive
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalDeals}</div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.winRate.toFixed(0)}%</div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{activities.filter(a => !a.done).length}</div>
              <p className="text-sm text-muted-foreground">Open Activities</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge className="mt-1">
                      {(contact?.deals_count || 0) > 0 ? 'Customer' : 'Lead'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Added</p>
                    <p className="mt-1">{contact?.add_time && format(new Date(contact.add_time), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Activity</p>
                    <p className="mt-1">
                      {contact?.last_activity_date 
                        ? formatDistance(new Date(contact.last_activity_date), new Date(), { addSuffix: true })
                        : 'No activity'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lifetime Value</p>
                    <p className="mt-1 font-semibold">${stats.wonValue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Deals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Jobs</CardTitle>
                <CardDescription>Latest service requests and jobs</CardDescription>
              </CardHeader>
              <CardContent>
                {deals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No jobs found</p>
                ) : (
                  <div className="space-y-3">
                    {deals.slice(0, 5).map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{deal.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(deal.add_time), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${deal.value?.toLocaleString()}</p>
                          <Badge variant={deal.status === 'won' ? 'default' : deal.status === 'lost' ? 'destructive' : 'secondary'}>
                            {deal.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading service history...</p>
                  </div>
                ) : deals.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No service history found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Service</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Amount</th>
                          <th className="text-left p-4 font-medium">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((deal) => (
                          <tr key={deal.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              {format(new Date(deal.add_time), 'MMM d, yyyy')}
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{deal.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Deal #{deal.id}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant={
                                deal.status === 'won' ? 'default' : 
                                deal.status === 'lost' ? 'destructive' : 
                                'secondary'
                              }>
                                {deal.status === 'won' ? 'Completed' : 
                                 deal.status === 'lost' ? 'Cancelled' : 
                                 'In Progress'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              ${deal.value?.toLocaleString()}
                            </td>
                            <td className="p-4">
                              {deal.won_time || deal.lost_time ? 
                                formatDistance(
                                  new Date(deal.add_time), 
                                  new Date(deal.won_time || deal.lost_time || ''),
                                  { addSuffix: false }
                                ) : '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
                <CardDescription>All interactions and communications</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No activities found</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const Icon = getActivityIcon(activity.type)
                      const color = getActivityColor(activity.type)
                      
                      return (
                        <div key={activity.id} className="flex gap-3">
                          <div className={`mt-1 ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className={`font-medium ${activity.done ? 'line-through text-gray-500' : ''}`}>
                                  {activity.subject}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(activity.add_time), 'PPP')}
                                  {activity.due_date && !activity.done && (
                                    <span className="ml-2">
                                      • Due {format(new Date(activity.due_date), 'PPP')}
                                    </span>
                                  )}
                                </p>
                              </div>
                              {activity.done && (
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Done
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes & Comments</CardTitle>
                <CardDescription>Internal notes about this contact</CardDescription>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No notes found</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Add Note
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 border rounded-lg">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.user_id?.name} • {format(new Date(note.add_time), 'PPP')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}