'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Phone, Mail, Calendar, MessageSquare, User, 
  FileText, DollarSign, Clock, CheckCircle2, 
  AlertCircle, Plus, Filter, Search, 
  Building, MapPin, Wrench, Timer,
  ArrowRight, ExternalLink, MoreVertical
} from 'lucide-react'
import { format, formatDistance } from 'date-fns'
import { PipedriveService } from '@/lib/integrations/pipedrive'
import { useIntegrations } from '@/contexts/integrations-context'

interface Activity {
  id: number
  type: string
  subject: string
  note?: string
  done: boolean
  due_date?: string
  due_time?: string
  duration?: string
  add_time: string
  update_time: string
  person_id?: { name: string; value: number }
  deal_id?: { title: string; value: number }
  org_id?: { name: string; value: number }
  owner_id?: { name: string; value: number }
  created_by_user_id?: { name: string; value: number }
}

const activityTypes = {
  call: { label: 'Call', icon: Phone, color: 'bg-blue-500' },
  meeting: { label: 'Meeting', icon: Calendar, color: 'bg-green-500' },
  task: { label: 'Task', icon: CheckCircle2, color: 'bg-orange-500' },
  deadline: { label: 'Deadline', icon: Clock, color: 'bg-red-500' },
  email: { label: 'Email', icon: Mail, color: 'bg-purple-500' },
  lunch: { label: 'Lunch', icon: MessageSquare, color: 'bg-yellow-500' }
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  low: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function ActivityFeed() {
  const { status, isLoading: integrationsLoading } = useIntegrations()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [newActivity, setNewActivity] = useState({
    type: 'call',
    subject: '',
    note: '',
    due_date: '',
    due_time: '',
    duration: '30'
  })

  useEffect(() => {
    if (!integrationsLoading && status.pipedrive) {
      fetchActivities()
    } else if (!integrationsLoading) {
      setLoading(false)
    }
  }, [integrationsLoading, status.pipedrive])

  const fetchActivities = async () => {
    try {
      const pipedrive = new PipedriveService()
      const response = await pipedrive.getActivities()
      
      if (response.success && response.data) {
        setActivities(response.data)
      } else if (response.error === 'Pipedrive not configured') {
        // Pipedrive is not configured, show empty state
        setActivities([])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const createActivity = async () => {
    if (!status.pipedrive) return

    try {
      const pipedrive = new PipedriveService()
      const activityData = {
        type: newActivity.type,
        subject: newActivity.subject,
        note: newActivity.note,
        due_date: newActivity.due_date || undefined,
        due_time: newActivity.due_time || undefined,
        duration: newActivity.duration ? `${newActivity.duration}:00` : undefined
      }

      const response = await pipedrive.createActivity(activityData)
      
      if (response.success) {
        await fetchActivities()
        setNewActivity({
          type: 'call',
          subject: '',
          note: '',
          due_date: '',
          due_time: '',
          duration: '30'
        })
      }
    } catch (error) {
      console.error('Error creating activity:', error)
    }
  }

  const markActivityDone = async (activityId: number, done: boolean) => {
    if (!status.pipedrive) return

    try {
      const pipedrive = new PipedriveService()
      await pipedrive.updateActivity(activityId, { done })
      
      setActivities(prev => prev.map(activity => 
        activity.id === activityId ? { ...activity, done } : activity
      ))
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.person_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.deal_id?.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || activity.type === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'done' && activity.done) ||
                         (filterStatus === 'pending' && !activity.done)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const upcomingActivities = filteredActivities.filter(a => !a.done && a.due_date)
  const recentActivities = filteredActivities.filter(a => a.done || !a.due_date)

  const ActivityIcon = ({ type }: { type: string }) => {
    const activityType = activityTypes[type as keyof typeof activityTypes] || activityTypes.task
    const Icon = activityType.icon
    return (
      <div className={`w-8 h-8 rounded-full ${activityType.color} flex items-center justify-center`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    )
  }

  const ActivityItem = ({ activity }: { activity: Activity }) => {
    const isOverdue = activity.due_date && !activity.done && new Date(activity.due_date) < new Date()
    const isDueToday = activity.due_date && format(new Date(activity.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    
    return (
      <div 
        className={`flex gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all ${
          activity.done ? 'opacity-60' : ''
        } ${isOverdue ? 'border-red-200 bg-red-50' : isDueToday ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}
        onClick={() => setSelectedActivity(activity)}
      >
        <ActivityIcon type={activity.type} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-medium ${activity.done ? 'line-through text-gray-500' : ''}`}>
                {activity.subject}
              </h4>
              
              {activity.note && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {activity.note}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {activity.person_id && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {activity.person_id.name}
                  </div>
                )}
                
                {activity.deal_id && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {activity.deal_id.title}
                  </div>
                )}
                
                {activity.org_id && (
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {activity.org_id.name}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {activity.due_date && (
                <div className={`text-xs px-2 py-1 rounded ${
                  isOverdue ? 'bg-red-100 text-red-700' : 
                  isDueToday ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.due_date && activity.due_time ? 
                    format(new Date(`${activity.due_date} ${activity.due_time}`), 'MMM d, h:mm a') :
                    format(new Date(activity.due_date), 'MMM d')
                  }
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  markActivityDone(activity.id, !activity.done)
                }}
                className={activity.done ? 'text-green-600' : 'text-gray-400'}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            {activity.created_by_user_id?.name} • {formatDistance(new Date(activity.add_time), new Date(), { addSuffix: true })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Add */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Activity Feed</h2>
          <p className="text-muted-foreground">Track all communications and tasks</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Quick Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
              <DialogDescription>
                Create a new activity that will sync with Pipedrive
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Activity Type</label>
                <Select value={newActivity.type} onValueChange={(value) => setNewActivity({...newActivity, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(activityTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  placeholder="e.g., Follow up with customer"
                  value={newActivity.subject}
                  onChange={(e) => setNewActivity({...newActivity, subject: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  placeholder="Additional details..."
                  value={newActivity.note}
                  onChange={(e) => setNewActivity({...newActivity, note: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={newActivity.due_date}
                    onChange={(e) => setNewActivity({...newActivity, due_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Time</label>
                  <Input
                    type="time"
                    value={newActivity.due_time}
                    onChange={(e) => setNewActivity({...newActivity, due_time: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <Select value={newActivity.duration} onValueChange={(value) => setNewActivity({...newActivity, duration: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={createActivity} className="w-full" disabled={!newActivity.subject || !status.pipedrive}>
                {!status.pipedrive ? 'Pipedrive Not Connected' : 'Create Activity'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(activityTypes).map(([key, type]) => (
              <SelectItem key={key} value={key}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="done">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Activities
            </CardTitle>
            <CardDescription>
              Scheduled activities that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading activities...</p>
              </div>
            ) : !status.pipedrive ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">Connect Pipedrive to view activities</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.href = '/dashboard/integrations'}
                >
                  Configure Integrations
                </Button>
              </div>
            ) : upcomingActivities.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No upcoming activities</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {upcomingActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Completed activities and historical timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading activities...</p>
              </div>
            ) : !status.pipedrive ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">Connect Pipedrive to view activities</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.href = '/dashboard/integrations'}
                >
                  Configure Integrations
                </Button>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No recent activities</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <ActivityIcon type={selectedActivity.type} />
                {selectedActivity.subject}
              </DialogTitle>
              <DialogDescription>
                Activity #{selectedActivity.id} • {activityTypes[selectedActivity.type as keyof typeof activityTypes]?.label || selectedActivity.type}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedActivity.note && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedActivity.note}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Schedule</h4>
                  <div className="space-y-1 text-sm">
                    {selectedActivity.due_date && (
                      <div>Due: {format(new Date(selectedActivity.due_date), 'PPP')}</div>
                    )}
                    {selectedActivity.due_time && (
                      <div>Time: {selectedActivity.due_time}</div>
                    )}
                    {selectedActivity.duration && (
                      <div>Duration: {selectedActivity.duration}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Related</h4>
                  <div className="space-y-1 text-sm">
                    {selectedActivity.person_id && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {selectedActivity.person_id.name}
                      </div>
                    )}
                    {selectedActivity.deal_id && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {selectedActivity.deal_id.title}
                      </div>
                    )}
                    {selectedActivity.org_id && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {selectedActivity.org_id.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant={selectedActivity.done ? "default" : "outline"}
                  onClick={() => {
                    markActivityDone(selectedActivity.id, !selectedActivity.done)
                    setSelectedActivity({...selectedActivity, done: !selectedActivity.done})
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {selectedActivity.done ? 'Mark Pending' : 'Mark Complete'}
                </Button>
                
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Pipedrive
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}