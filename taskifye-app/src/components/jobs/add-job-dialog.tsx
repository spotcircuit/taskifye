'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Search, Loader2 } from 'lucide-react'
import { useIntegrations } from '@/contexts/integrations-context'

interface AddJobDialogProps {
  trigger?: React.ReactNode
  onJobCreated?: (job: any) => void
}

export function AddJobDialog({ trigger, onJobCreated }: AddJobDialogProps) {
  const { status } = useIntegrations()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  
  const [jobData, setJobData] = useState({
    title: '',
    jobType: 'service',
    serviceType: 'hvac-repair',
    priority: 'medium',
    value: '',
    address: '',
    description: '',
    customerId: null as number | null,
  })

  const searchCustomers = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      return
    }

    if (!status.pipedrive) return

    setSearchingCustomer(true)
    try {
      const response = await fetch('/api/integrations/pipedrive', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-client-id': localStorage.getItem('current_client_id') || 'client-1'
        },
        body: JSON.stringify({
          action: 'getPersons',
          options: { term }
        })
      })
      const data = await response.json()
      setSearchResults(data.data?.items || [])
    } catch (error) {
      console.error('Error searching customers:', error)
    } finally {
      setSearchingCustomer(false)
    }
  }

  const handleSubmit = async () => {
    if (!jobData.title || !selectedCustomer) {
      alert('Please fill in required fields')
      return
    }

    if (!status.pipedrive) {
      alert('Please connect Pipedrive first in the Integrations page')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/integrations/pipedrive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': localStorage.getItem('current_client_id') || 'client-1'
        },
        body: JSON.stringify({
          action: 'createDeal',
          title: jobData.title,
          value: jobData.value,
          person_id: selectedCustomer?.item?.id,
          org_id: selectedCustomer?.item?.organization?.id,
          expected_close_date: scheduledDate?.toISOString().split('T')[0],
          // Additional job details can be stored in custom fields
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Job created successfully!')
        onJobCreated?.(result.job)
        setOpen(false)
        
        // Reset form
        setJobData({
          title: '',
          jobType: 'service',
          serviceType: 'hvac-repair',
          priority: 'medium',
          value: '',
          address: '',
          description: '',
          customerId: null,
        })
        setSelectedCustomer(null)
        setScheduledDate(undefined)
      } else {
        alert('Failed to create job: ' + result.error)
      }
    } catch (error) {
      alert('Error creating job: ' + error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Add a new service job to your pipeline
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Customer Search */}
          <div className="space-y-2">
            <Label>Customer *</Label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{selectedCustomer.item.name}</p>
                  {selectedCustomer.item.organization && (
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.item.organization.name}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(null)
                    setCustomerSearch('')
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    className="pl-10"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      searchCustomers(e.target.value)
                    }}
                  />
                </div>
                {searchingCustomer && (
                  <p className="text-sm text-muted-foreground">Searching...</p>
                )}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.item.id}
                        className="w-full text-left p-3 hover:bg-muted/50 border-b last:border-b-0"
                        onClick={() => {
                          setSelectedCustomer(result)
                          setSearchResults([])
                          // Pre-fill address if available
                          if (result.item.address) {
                            setJobData({ ...jobData, address: result.item.address })
                          }
                        }}
                      >
                        <p className="font-medium">{result.item.name}</p>
                        {result.item.primary_email && (
                          <p className="text-sm text-muted-foreground">{result.item.primary_email}</p>
                        )}
                        {result.item.organization && (
                          <p className="text-sm text-muted-foreground">{result.item.organization.name}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., AC Repair - Unit not cooling"
              value={jobData.title}
              onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
            />
          </div>

          {/* Job Type and Service Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select
                value={jobData.jobType}
                onValueChange={(value) => setJobData({ ...jobData, jobType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service Call</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="quote">Quote Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select
                value={jobData.serviceType}
                onValueChange={(value) => setJobData({ ...jobData, serviceType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hvac-repair">HVAC Repair</SelectItem>
                  <SelectItem value="hvac-maintenance">HVAC Maintenance</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="appliance">Appliance Repair</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={jobData.priority}
                onValueChange={(value) => setJobData({ ...jobData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Estimated Value ($)</Label>
              <Input
                id="value"
                type="number"
                placeholder="0.00"
                value={jobData.value}
                onChange={(e) => setJobData({ ...jobData, value: e.target.value })}
              />
            </div>
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <Label>Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Service Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, State ZIP"
              value={jobData.address}
              onChange={(e) => setJobData({ ...jobData, address: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue or work to be done..."
              className="min-h-[100px]"
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !jobData.title || !selectedCustomer}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Job'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}