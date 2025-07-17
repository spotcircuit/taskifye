'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, 
  MapPin, User, Plus, Filter
} from 'lucide-react'

const technicians = [
  { id: 1, name: 'Mike Rodriguez', color: 'bg-blue-500' },
  { id: 2, name: 'Sarah Lopez', color: 'bg-green-500' },
  { id: 3, name: 'John Davis', color: 'bg-purple-500' },
  { id: 4, name: 'Lisa Martinez', color: 'bg-orange-500' },
]

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
  '4:00 PM', '5:00 PM'
]

const sampleAppointments = [
  { id: 1, techId: 1, time: '9:00 AM', duration: 2, customer: 'Johnson Residence', service: 'AC Installation', address: '123 Main St' },
  { id: 2, techId: 2, time: '10:00 AM', duration: 1, customer: 'ABC Office', service: 'Maintenance', address: '456 Business Pkwy' },
  { id: 3, techId: 1, time: '2:00 PM', duration: 1, customer: 'Smith Home', service: 'Repair', address: '789 Oak Ave' },
  { id: 4, techId: 3, time: '11:00 AM', duration: 3, customer: 'Mall Complex', service: 'System Check', address: '321 Commerce Dr' },
]

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewType, setViewType] = useState<'day' | 'week'>('day')

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getAppointmentStyle = (techId: number) => {
    const tech = technicians.find(t => t.id === techId)
    return tech?.color || 'bg-gray-500'
  }

  const getAppointmentPosition = (time: string, duration: number) => {
    const index = timeSlots.indexOf(time)
    return {
      top: `${index * 80}px`,
      height: `${duration * 80 - 8}px`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage technician schedules and appointments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="sm:size-default">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Appointment</span>
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-base sm:text-xl font-semibold text-center flex-1 sm:flex-none">{formatDate(selectedDate)}</h2>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant={viewType === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('day')}
              >
                Day View
              </Button>
              <Button
                variant={viewType === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('week')}
              >
                Week View
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Schedule Grid - Mobile: Show simplified list view */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Desktop Grid View */}
        <div className="hidden md:block">
          <div className="grid grid-cols-5 border-b">
            <div className="p-4 border-r bg-gray-50">
              <span className="text-sm font-medium text-muted-foreground">Time</span>
            </div>
            {technicians.map((tech) => (
              <div key={tech.id} className="p-4 border-r text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${tech.color}`} />
                  <span className="text-sm font-medium">{tech.name}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            {/* Time slots */}
            {timeSlots.map((time, index) => (
              <div key={time} className="grid grid-cols-5 border-b" style={{ height: '80px' }}>
                <div className="p-4 border-r bg-gray-50">
                  <span className="text-sm text-muted-foreground">{time}</span>
                </div>
                {technicians.map((tech) => (
                  <div key={tech.id} className="border-r relative" />
                ))}
              </div>
            ))}

            {/* Appointments overlay */}
            {sampleAppointments.map((apt) => {
              const position = getAppointmentPosition(apt.time, apt.duration)
              const techIndex = technicians.findIndex(t => t.id === apt.techId)
              return (
                <div
                  key={apt.id}
                  className={`absolute p-3 m-1 rounded-lg text-white text-sm cursor-pointer hover:shadow-lg transition-shadow ${getAppointmentStyle(apt.techId)}`}
                  style={{
                    ...position,
                    left: `${20 + techIndex * 20}%`,
                    width: 'calc(20% - 8px)'
                  }}
                >
                  <p className="font-semibold">{apt.customer}</p>
                  <p className="text-xs opacity-90">{apt.service}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{apt.address}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden">
          <div className="divide-y">
            {sampleAppointments.map((apt) => {
              const tech = technicians.find(t => t.id === apt.techId)
              return (
                <div key={apt.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${tech?.color}`} />
                        <span className="text-sm font-medium">{tech?.name}</span>
                      </div>
                      <h3 className="font-semibold">{apt.customer}</h3>
                      <p className="text-sm text-muted-foreground">{apt.service}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{apt.time} ({apt.duration}h)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{apt.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Working today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drive Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5h</div>
            <p className="text-xs text-muted-foreground">Total estimated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,450</div>
            <p className="text-xs text-muted-foreground">Potential today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}