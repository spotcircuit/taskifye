'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddJobDialog } from '@/components/jobs/add-job-dialog'
import { 
  Plus, Filter, Calendar, Clock, CheckCircle, 
  AlertCircle, DollarSign, User, MoreVertical,
  MapPin, Wrench, FileText, Search, ArrowRight,
  Phone, Mail, Building, Camera, Navigation,
  Loader2, ChevronDown, Timer, Package, GripVertical
} from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'
import { format } from 'date-fns'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  closestCorners,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Job {
  id: number
  title: string
  person_id?: { name: string; value: number }
  org_id?: { name: string; value: number }
  value: number
  currency: string
  stage_id: number
  status: string
  add_time: string
  update_time: string
  expected_close_date?: string
  won_time?: string
  lost_time?: string
  owner_id?: { name: string; value: number }
  // These would be custom fields in Pipedrive
  [key: string]: any // For custom fields
}

// Real Pipedrive stages mapped to our workflow
const jobStages = [
  { id: 1, key: 'lead', label: 'New Lead', color: 'bg-gray-500', icon: FileText },
  { id: 2, key: 'estimate', label: 'Estimate Sent', color: 'bg-blue-500', icon: DollarSign },
  { id: 3, key: 'scheduled', label: 'Scheduled', color: 'bg-yellow-500', icon: Calendar },
  { id: 4, key: 'in_progress', label: 'In Progress', color: 'bg-orange-500', icon: Clock },
  { id: 5, key: 'completed', label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
]

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'pipeline' | 'list' | 'calendar'>('pipeline')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTech, setFilterTech] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<string>('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  
  // Drag and drop state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      setLoading(false)
      return
    }

    try {
      const pipedrive = new PipedriveService(apiKey)
      const response = await pipedrive.getDeals({ status: 'all_not_deleted' })
      
      if (response.success && response.deals) {
        setJobs(response.deals)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateJobStage = async (jobId: number, newStageId: number) => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) return

    try {
      const pipedrive = new PipedriveService(apiKey)
      await pipedrive.updateDeal(jobId, { stage_id: newStageId })
      
      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, stage_id: newStageId } : job
      ))
    } catch (error) {
      console.error('Error updating job stage:', error)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setIsDragging(false)

    if (!over) return

    const jobId = parseInt(active.id.toString())
    
    // Check if dropping over a stage container
    let newStageId: number | null = null
    
    if (over.id.toString().startsWith('stage-')) {
      newStageId = parseInt(over.id.toString().split('-')[1])
    } else {
      // If dropping over another job, find which stage that job belongs to
      const overJobId = parseInt(over.id.toString())
      const overJob = jobs.find(j => j.id === overJobId)
      if (overJob) {
        newStageId = overJob.stage_id
      }
    }
    
    if (newStageId && !isNaN(newStageId)) {
      const job = jobs.find(j => j.id === jobId)
      if (job && job.stage_id !== newStageId) {
        updateJobStage(jobId, newStageId)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setIsDragging(false)
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.person_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.org_id?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Add more filters as needed
    return matchesSearch
  })

  const jobsByStage = jobStages.reduce((acc, stage) => {
    acc[stage.id] = filteredJobs.filter(job => job.stage_id === stage.id)
    return acc
  }, {} as Record<number, Job[]>)

  const stats = {
    totalValue: jobs.reduce((sum, job) => sum + (job.value || 0), 0),
    todayJobs: jobs.filter(job => {
      const scheduled = job.expected_close_date
      return scheduled && new Date(scheduled).toDateString() === new Date().toDateString()
    }).length,
    urgentJobs: 0, // Would need custom field in Pipedrive
    completionRate: jobs.length > 0 
      ? Math.round((jobs.filter(j => j.status === 'won').length / jobs.length) * 100)
      : 0
  }

  // Sortable Job Card Component
  const SortableJobCard = ({ job, showStage = false }: { job: Job; showStage?: boolean }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: job.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    const stage = jobStages.find(s => s.id === job.stage_id)
    
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all cursor-pointer ${
          isDragging ? 'z-50 rotate-2 shadow-lg' : ''
        }`}
        onClick={() => !isDragging && setSelectedJob(job)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start gap-2 flex-1">
            <div 
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 -m-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-1">{job.title}</h4>
              {job.person_id && (
                <p className="text-xs text-muted-foreground mt-1">
                  {job.person_id.name}
                  {job.org_id && ` • ${job.org_id.name}`}
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              // Add dropdown menu here
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {showStage && stage && (
          <Badge className={`${stage.color} text-white mb-2 ml-6`}>
            {stage.label}
          </Badge>
        )}
        
        <div className="flex items-center justify-between ml-6">
          <span className="font-semibold text-green-600">
            ${job.value.toLocaleString()}
          </span>
          {/* Priority would be a custom field in Pipedrive */}
        </div>

        {job.expected_close_date && (
          <div className="mt-2 ml-6 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(job.expected_close_date), 'MMM d, h:mm a')}
          </div>
        )}

        {job.owner_id && (
          <div className="mt-1 ml-6 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {job.owner_id.name}
          </div>
        )}
      </div>
    )
  }

  // Droppable Stage Component
  const DroppableStage = ({ stage, children }: { stage: any; children: React.ReactNode }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: `stage-${stage.id}`,
    })

    return (
      <div 
        ref={setNodeRef}
        className={`bg-gray-50 rounded-lg p-4 transition-all ${
          isDragging ? 'bg-gray-100' : ''
        } ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}
      >
        {children}
      </div>
    )
  }

  // Regular Job Card for List/Calendar views (non-draggable)
  const JobCard = ({ job, showStage = false }: { job: Job; showStage?: boolean }) => {
    const stage = jobStages.find(s => s.id === job.stage_id)
    
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all cursor-pointer"
        onClick={() => setSelectedJob(job)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm line-clamp-1">{job.title}</h4>
            {job.person_id && (
              <p className="text-xs text-muted-foreground mt-1">
                {job.person_id.name}
                {job.org_id && ` • ${job.org_id.name}`}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              // Add dropdown menu here
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {showStage && stage && (
          <Badge className={`${stage.color} text-white mb-2`}>
            {stage.label}
          </Badge>
        )}
        
        <div className="flex items-center justify-between">
          <span className="font-semibold text-green-600">
            ${job.value.toLocaleString()}
          </span>
          {/* Priority would be a custom field in Pipedrive */}
        </div>

        {job.expected_close_date && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(job.expected_close_date), 'MMM d, h:mm a')}
          </div>
        )}

        {job.owner_id && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {job.owner_id.name}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jobs Management</h1>
          <p className="text-muted-foreground mt-2">
            Track all jobs from lead to completion. Add new jobs using stage-specific buttons below.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" title="Advanced filtering options">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, customers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterTech} onValueChange={setFilterTech}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Technicians" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            <SelectItem value="mike">Mike Rodriguez</SelectItem>
            <SelectItem value="sarah">Sarah Lopez</SelectItem>
            <SelectItem value="john">John Davis</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDateRange} onValueChange={setFilterDateRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jobs Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayJobs}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urgent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.urgentJobs}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={selectedView} onValueChange={(v: any) => setSelectedView(v)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* Pipeline View */}
        <TabsContent value="pipeline" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Loading jobs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                    <GripVertical className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm">Drag & Drop Jobs</h4>
                    <p className="text-blue-700 text-xs mt-1">
                      Grab the grip handle (⋮⋮) on any job card to drag it between stages. 
                      Changes sync automatically with Pipedrive.
                    </p>
                  </div>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {jobStages.map((stage) => (
                    <DroppableStage key={stage.id} stage={stage}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                          <h3 className="font-semibold text-sm">{stage.label}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {jobsByStage[stage.id]?.length || 0}
                          </span>
                          {isDragging && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Drop zone active" />
                          )}
                        </div>
                      </div>
                      
                      <SortableContext 
                        items={jobsByStage[stage.id]?.map(job => job.id) || []}
                        strategy={verticalListSortingStrategy}
                      >
                        <div 
                          className={`space-y-2 max-h-[600px] overflow-y-auto min-h-[100px] rounded-lg transition-all ${
                            isDragging ? 'bg-blue-50/50 border-2 border-dashed border-blue-300' : 'border-2 border-transparent'
                          }`}
                        >
                          {jobsByStage[stage.id]?.map((job) => (
                            <SortableJobCard key={job.id} job={job} />
                          ))}
                          {(!jobsByStage[stage.id] || jobsByStage[stage.id].length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                              <stage.icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">No jobs in this stage</p>
                              {isDragging && (
                                <p className="text-xs text-blue-600 mt-1">Drop here to move job</p>
                              )}
                            </div>
                          )}
                        </div>
                      </SortableContext>

                      <AddJobDialog 
                        trigger={
                          <Button 
                            variant="ghost" 
                            className="w-full mt-3 text-xs"
                            title={`Add new job directly to ${stage.label} stage`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add {stage.label}
                          </Button>
                        }
                        onJobCreated={() => fetchJobs()}
                      />
                    </DroppableStage>
                  ))}
                </div>

                <DragOverlay>
                  {activeId ? (
                    <div className="rotate-2 opacity-95 scale-105">
                      {(() => {
                        const job = jobs.find(j => j.id === activeId)
                        return job ? <SortableJobCard job={job} /> : null
                      })()}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No jobs found</p>
                  <p className="text-muted-foreground">Create your first job to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Job</th>
                        <th className="text-left p-4 font-medium">Customer</th>
                        <th className="text-left p-4 font-medium">Stage</th>
                        <th className="text-left p-4 font-medium">Value</th>
                        <th className="text-left p-4 font-medium">Scheduled</th>
                        <th className="text-left p-4 font-medium">Technician</th>
                        <th className="text-left p-4 font-medium">Priority</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => {
                        const stage = jobStages.find(s => s.id === job.stage_id)
                        return (
                          <tr key={job.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="font-medium">{job.title}</div>
                              <div className="text-sm text-muted-foreground">
                                #{job.id}
                              </div>
                            </td>
                            <td className="p-4">
                              {job.person_id && (
                                <div>
                                  <div className="font-medium">{job.person_id.name}</div>
                                  {job.org_id && (
                                    <div className="text-sm text-muted-foreground">
                                      {job.org_id.name}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              {stage && (
                                <Badge className={`${stage.color} text-white`}>
                                  {stage.label}
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-green-600">
                                ${job.value.toLocaleString()}
                              </div>
                            </td>
                            <td className="p-4">
                              {job.expected_close_date ? (
                                <div className="text-sm">
                                  {format(new Date(job.expected_close_date), 'MMM d, yyyy')}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              {job.owner_id ? (
                                <div className="text-sm">{job.owner_id.name}</div>
                              ) : (
                                <span className="text-muted-foreground">Unassigned</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="text-muted-foreground">-</span>
                            </td>
                            <td className="p-4">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedJob(job)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View Placeholder */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Calendar View Coming Soon</p>
              <p className="text-muted-foreground">
                View and manage jobs in a calendar format
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Detail Modal/Sheet would go here */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedJob.title}</CardTitle>
                  <CardDescription>Job #{selectedJob.id}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedJob(null)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add comprehensive job details here */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    {selectedJob.person_id && (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {selectedJob.person_id.name}
                        </div>
                        {selectedJob.org_id && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {selectedJob.org_id.name}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Job Status</h4>
                  <Select 
                    value={selectedJob.stage_id.toString()}
                    onValueChange={(value) => {
                      updateJobStage(selectedJob.id, parseInt(value))
                      setSelectedJob({ ...selectedJob, stage_id: parseInt(value) })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobStages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Actions - Only what Pipedrive supports */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Activity
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>

              {/* Job Information */}
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Job Details</h4>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deal Value:</span>
                      <span className="font-medium text-green-600">${selectedJob.value?.toLocaleString() || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency:</span>
                      <span>{selectedJob.currency || 'USD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize">{selectedJob.status || 'Open'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{selectedJob.add_time ? new Date(selectedJob.add_time).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    {selectedJob.expected_close_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Close:</span>
                        <span>{new Date(selectedJob.expected_close_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedJob.won_time && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Won Date:</span>
                        <span>{new Date(selectedJob.won_time).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                {(selectedJob.person_id || selectedJob.org_id) && (
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      {selectedJob.person_id && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">{selectedJob.person_id.name}</div>
                          {selectedJob.org_id && (
                            <div className="text-muted-foreground">{selectedJob.org_id.name}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Owner Information */}
                {selectedJob.owner_id && (
                  <div>
                    <h4 className="font-medium mb-2">Assigned To</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>{selectedJob.owner_id.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}