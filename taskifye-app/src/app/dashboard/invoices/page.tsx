'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, Filter, Receipt, Clock, CheckCircle, 
  AlertCircle, DollarSign, Calendar, Download,
  Send, CreditCard, AlertTriangle, Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const invoiceStatuses = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Receipt },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
}

const sampleInvoices = [
  {
    id: 'INV-2024-001',
    customer: 'Wilson Estate',
    service: 'HVAC System Installation',
    amount: '$15,750',
    status: 'paid',
    date: '2024-01-10',
    dueDate: '2024-01-25',
    paidDate: '2024-01-22',
  },
  {
    id: 'INV-2024-002',
    customer: 'Davis Building',
    service: 'Emergency AC Repair',
    amount: '$2,450',
    status: 'overdue',
    date: '2024-01-05',
    dueDate: '2024-01-20',
    daysOverdue: 3,
  },
  {
    id: 'INV-2024-003',
    customer: 'Taylor Shop',
    service: 'Monthly Maintenance',
    amount: '$650',
    status: 'sent',
    date: '2024-01-15',
    dueDate: '2024-01-30',
  },
  {
    id: 'INV-2024-004',
    customer: 'Brown Property',
    service: 'Furnace Replacement',
    amount: '$8,200',
    status: 'viewed',
    date: '2024-01-12',
    dueDate: '2024-01-27',
  },
]

export default function InvoicesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const filteredInvoices = sampleInvoices.filter(invoice => {
    const matchesSearch = invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !selectedStatus || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const stats = [
    { 
      title: 'Outstanding', 
      value: '$28,450', 
      subtext: '12 invoices', 
      icon: DollarSign,
      color: 'text-orange-600' 
    },
    { 
      title: 'Overdue', 
      value: '$8,200', 
      subtext: '3 invoices', 
      icon: AlertTriangle,
      color: 'text-red-600' 
    },
    { 
      title: 'Paid This Month', 
      value: '$45,600', 
      subtext: '18 invoices', 
      icon: CheckCircle,
      color: 'text-green-600' 
    },
    { 
      title: 'Average Days to Pay', 
      value: '14.5', 
      subtext: '-2.5 from last month', 
      icon: Clock,
      color: 'text-blue-600' 
    },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-2">
            Track payments and manage customer invoices
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push('/dashboard/invoices/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
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
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {Object.entries(invoiceStatuses).map(([key, status]) => (
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

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            View and manage all customer invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => {
              const status = invoiceStatuses[invoice.status as keyof typeof invoiceStatuses]
              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      invoice.status === 'paid' ? 'bg-green-100' :
                      invoice.status === 'overdue' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      <Receipt className={`h-6 w-6 ${
                        invoice.status === 'paid' ? 'text-green-600' :
                        invoice.status === 'overdue' ? 'text-red-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{invoice.id}</h4>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                        {invoice.daysOverdue && (
                          <span className="text-xs text-red-600 font-medium">
                            {invoice.daysOverdue} days overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                      <p className="text-xs text-muted-foreground mt-1">{invoice.service}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-semibold ${
                        invoice.status === 'paid' ? 'text-green-600' :
                        invoice.status === 'overdue' ? 'text-red-600' :
                        'text-foreground'
                      }`}>{invoice.amount}</p>
                      {invoice.paidDate && (
                        <p className="text-xs text-muted-foreground">Paid {invoice.paidDate}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Issued {invoice.date}</p>
                      <p className="text-xs text-muted-foreground">Due {invoice.dueDate}</p>
                    </div>
                    <div className="flex gap-1">
                      {invoice.status !== 'paid' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle payment recording
                          }}
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}
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
                      {invoice.status !== 'paid' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle send reminder
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Send Reminders</h3>
                <p className="text-sm text-muted-foreground">3 overdue invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Batch Invoice</h3>
                <p className="text-sm text-muted-foreground">Create recurring invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Payment Report</h3>
                <p className="text-sm text-muted-foreground">Export payment history</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}