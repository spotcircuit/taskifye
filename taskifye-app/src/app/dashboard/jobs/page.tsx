'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, Filter, Calendar, Clock, CheckCircle, 
  AlertCircle, DollarSign, User, MoreVertical,
  MapPin, Wrench, FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Job status pipeline
const jobStatuses = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-500', icon: FileText },
  { id: 'quoted', label: 'Quoted', color: 'bg-blue-500', icon: DollarSign },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-yellow-500', icon: Calendar },
  { id: 'in_progress', label: 'In Progress', color: 'bg-orange-500', icon: Clock },
  { id: 'completed', label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
]

// Sample jobs data
const sampleJobs = {
  lead: [
    { id: 1, customer: 'New inquiry - Thompson', service: 'AC Installation Quote', value: '$4,500', priority: 'high' },
    { id: 2, customer: 'Web form - Martinez', service: 'Heating System Check', value: '$350', priority: 'medium' },
  ],
  quoted: [
    { id: 3, customer: 'Johnson Residence', service: 'Full HVAC Replacement', value: '$12,000', priority: 'high' },
    { id: 4, customer: 'Office Park LLC', service: 'Commercial AC Service', value: '$8,500', priority: 'medium' },
  ],
  scheduled: [
    { id: 5, customer: 'Smith Home', service: 'AC Tune-up', value: '$250', date: 'Today 2:00 PM', tech: 'Mike R.' },
    { id: 6, customer: 'Brown Property', service: 'Furnace Repair', value: '$650', date: 'Tomorrow 9:00 AM', tech: 'Sarah L.' },
  ],
  in_progress: [
    { id: 7, customer: 'Wilson Estate', service: 'Duct Cleaning', value: '$800', tech: 'John D.', started: '10:30 AM' },
  ],
  completed: [
    { id: 8, customer: 'Davis Building', service: 'AC Filter Replace', value: '$150', completedBy: 'Tom K.', time: '1 hour ago' },
    { id: 9, customer: 'Taylor Shop', service: 'Thermostat Install', value: '$450', completedBy: 'Lisa M.', time: '3 hours ago' },
  ],
}

export default function JobsPage() {
  const router = useRouter()
  const [selectedView, setSelectedView] = useState<'pipeline' | 'list'>('pipeline')

  const JobCard = ({ job, status }: { job: any, status: string }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm">{job.customer}</h4>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">{job.service}</p>
        
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-green-600">{job.value}</span>
          {job.priority && (
            <span className={`px-2 py-1 rounded-full ${
              job.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {job.priority}
            </span>
          )}
        </div>

        {job.date && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {job.date}
          </div>
        )}

        {job.tech && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {job.tech}
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
            Track all jobs from lead to completion
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/dashboard/jobs/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={selectedView === 'pipeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('pipeline')}
        >
          Pipeline View
        </Button>
        <Button
          variant={selectedView === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('list')}
        >
          List View
        </Button>
      </div>

      {/* Pipeline View */}
      {selectedView === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {jobStatuses.map((status) => (
            <div key={status.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <h3 className="font-semibold text-sm">{status.label}</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {sampleJobs[status.id as keyof typeof sampleJobs]?.length || 0}
                </span>
              </div>
              
              <div className="space-y-2">
                {sampleJobs[status.id as keyof typeof sampleJobs]?.map((job) => (
                  <JobCard key={job.id} job={job} status={status.id} />
                ))}
              </div>

              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={() => router.push(`/dashboard/jobs/new?status=${status.id}`)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add {status.label}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$38,950</div>
            <p className="text-xs text-muted-foreground">Across all stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jobs Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 completed, 5 remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urgent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">Quote to job conversion</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}