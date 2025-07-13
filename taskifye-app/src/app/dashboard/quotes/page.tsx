'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, Filter, FileText, Clock, CheckCircle, 
  XCircle, DollarSign, Calendar, User, MoreVertical,
  Send, Download, Copy, Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const quoteStatuses = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const sampleQuotes = [
  {
    id: 'Q-2024-001',
    customer: 'Johnson Residence',
    service: 'Complete HVAC System Replacement',
    amount: '$12,500',
    status: 'sent',
    date: '2024-01-15',
    validUntil: '2024-02-15',
    items: 4,
  },
  {
    id: 'Q-2024-002',
    customer: 'ABC Office Building',
    service: 'Annual Maintenance Contract',
    amount: '$8,200',
    status: 'accepted',
    date: '2024-01-14',
    validUntil: '2024-02-14',
    items: 6,
  },
  {
    id: 'Q-2024-003',
    customer: 'Smith Home',
    service: 'AC Unit Repair & Tune-up',
    amount: '$850',
    status: 'viewed',
    date: '2024-01-13',
    validUntil: '2024-01-27',
    items: 3,
  },
  {
    id: 'Q-2024-004',
    customer: 'Green Valley Mall',
    service: 'Emergency HVAC Repair',
    amount: '$3,200',
    status: 'draft',
    date: '2024-01-12',
    validUntil: '2024-01-26',
    items: 2,
  },
]

export default function QuotesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const filteredQuotes = sampleQuotes.filter(quote => {
    const matchesSearch = quote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !selectedStatus || quote.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const stats = [
    { title: 'Total Quotes', value: '24', subtext: 'This month', icon: FileText },
    { title: 'Pending Value', value: '$45,200', subtext: '8 quotes', icon: DollarSign },
    { title: 'Conversion Rate', value: '68%', subtext: '+5% from last month', icon: CheckCircle },
    { title: 'Avg. Response Time', value: '2.5 days', subtext: 'To accept/reject', icon: Clock },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage service quotes for customers
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push('/dashboard/quotes/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Quote
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {Object.entries(quoteStatuses).map(([key, status]) => (
            <Button
              key={key}
              variant={selectedStatus === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
            >
              <status.icon className="mr-2 h-4 w-4" />
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
          <CardDescription>
            Manage and track all your service quotes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const status = quoteStatuses[quote.status as keyof typeof quoteStatuses]
              return (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{quote.id}</h4>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{quote.customer}</p>
                      <p className="text-xs text-muted-foreground mt-1">{quote.service}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{quote.amount}</p>
                      <p className="text-xs text-muted-foreground">{quote.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{quote.date}</p>
                      <p className="text-xs text-muted-foreground">Valid until {quote.validUntil}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle download
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle copy
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle more options
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}