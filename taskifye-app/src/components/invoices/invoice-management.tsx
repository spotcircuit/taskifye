'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, Filter, Receipt, Clock, CheckCircle, 
  AlertCircle, DollarSign, Calendar, Download,
  Send, CreditCard, AlertTriangle, Search,
  Loader2, TrendingUp, FileText, Mail,
  ExternalLink, Banknote, Timer
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'
import { format, addDays, differenceInDays, isPast, isToday, isFuture } from 'date-fns'

interface Invoice {
  id: number
  dealId: number
  invoiceNumber: string
  title: string
  person_id?: { name: string; value: number }
  org_id?: { name: string; value: number }
  value: number
  currency: string
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paidDate?: string
  paymentMethod?: string
  items?: any[]
  notes?: string
}

const invoiceStatuses = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Receipt },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
}

export function InvoiceManagement() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'credit_card',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      setLoading(false)
      return
    }

    try {
      const pipedrive = new PipedriveService(apiKey)
      const response = await pipedrive.getDeals({ status: 'all_not_deleted' })
      
      if (response.success && response.deals) {
        // Filter deals that represent invoices (completed jobs or specific stages)
        const invoiceDeals = response.deals
          .filter((deal: any) => 
            deal.stage_id >= 5 || // Assuming later stages are for completed/invoiced jobs
            deal.title.toLowerCase().includes('invoice') ||
            deal.status === 'won'
          )
          .map((deal: any) => {
            // Extract invoice data from deal
            const invoiceNumber = deal.title.match(/INV-\d{4}-\d{3}/)?.[0] || `INV-${new Date().getFullYear()}-${String(deal.id).padStart(3, '0')}`
            const issueDate = deal.won_time || deal.update_time
            const dueDate = format(addDays(new Date(issueDate), 30), 'yyyy-MM-dd') // Default 30 days
            
            // Determine invoice status
            let status: Invoice['status'] = 'draft'
            if (deal.status === 'won') {
              status = 'paid'
            } else if (isPast(new Date(dueDate))) {
              status = 'overdue'
            } else if (deal.stage_id === 6) { // Assuming stage 6 is "Invoiced"
              status = 'sent'
            }
            
            return {
              id: deal.id,
              dealId: deal.id,
              invoiceNumber,
              title: deal.title,
              person_id: deal.person_id,
              org_id: deal.org_id,
              value: deal.value || 0,
              currency: deal.currency || 'USD',
              status,
              issueDate,
              dueDate,
              paidDate: deal.won_time,
              notes: deal.notes
            } as Invoice
          })
        
        setInvoices(invoiceDeals)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const createInvoiceFromDeal = async (dealId: number) => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) return

    try {
      const pipedrive = new PipedriveService(apiKey)
      
      // Move deal to "Invoiced" stage
      await pipedrive.updateDeal(dealId, { stage_id: 6 }) // Assuming stage 6 is "Invoiced"
      
      // Add note with invoice details
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(dealId).padStart(3, '0')}`
      const invoiceNote = `
Invoice Created: ${invoiceNumber}
Date: ${format(new Date(), 'PPP')}
Due Date: ${format(addDays(new Date(), 30), 'PPP')}
Status: Sent to customer
      `
      
      await pipedrive.addNote('deal', dealId, invoiceNote)
      
      // Refresh invoices
      await fetchInvoices()
      
      alert('Invoice created successfully!')
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice')
    }
  }

  const recordPayment = async () => {
    if (!selectedInvoice || !paymentData.amount) return

    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) return

    try {
      const pipedrive = new PipedriveService(apiKey)
      
      // Update deal to won status
      await pipedrive.updateDeal(selectedInvoice.dealId, { 
        status: 'won',
        won_time: paymentData.date
      })
      
      // Add payment note
      const paymentNote = `
Payment Received for ${selectedInvoice.invoiceNumber}
Amount: $${paymentData.amount}
Method: ${paymentData.method.replace('_', ' ').toUpperCase()}
Date: ${format(new Date(paymentData.date), 'PPP')}
${paymentData.notes ? `Notes: ${paymentData.notes}` : ''}
      `
      
      await pipedrive.addNote('deal', selectedInvoice.dealId, paymentNote)
      
      // Create activity for payment
      await pipedrive.createActivity({
        subject: `Payment received - ${selectedInvoice.invoiceNumber}`,
        type: 'task',
        deal_id: selectedInvoice.dealId,
        person_id: selectedInvoice.person_id?.value,
        done: true,
        note: paymentNote
      })
      
      setShowPaymentDialog(false)
      setSelectedInvoice(null)
      setPaymentData({
        amount: '',
        method: 'credit_card',
        notes: '',
        date: format(new Date(), 'yyyy-MM-dd')
      })
      
      // Refresh invoices
      await fetchInvoices()
      
      alert('Payment recorded successfully!')
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Failed to record payment')
    }
  }

  const sendReminder = async (invoice: Invoice) => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) return

    try {
      const pipedrive = new PipedriveService(apiKey)
      
      // Create activity for reminder
      await pipedrive.createActivity({
        subject: `Payment reminder sent - ${invoice.invoiceNumber}`,
        type: 'email',
        deal_id: invoice.dealId,
        person_id: invoice.person_id?.value,
        due_date: format(new Date(), 'yyyy-MM-dd'),
        done: true,
        note: `Payment reminder sent for invoice ${invoice.invoiceNumber}. Amount due: $${invoice.value}`
      })
      
      alert('Reminder sent successfully!')
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Failed to send reminder')
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.person_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.org_id?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !selectedStatus || invoice.status === selectedStatus
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const invoiceDate = new Date(invoice.issueDate)
        const now = new Date()
        
        switch (dateFilter) {
          case 'overdue':
            matchesDate = invoice.status === 'overdue'
            break
          case 'due_today':
            matchesDate = isToday(new Date(invoice.dueDate)) && invoice.status !== 'paid'
            break
          case 'due_week':
            const weekFromNow = addDays(now, 7)
            matchesDate = isFuture(new Date(invoice.dueDate)) && 
                         new Date(invoice.dueDate) <= weekFromNow && 
                         invoice.status !== 'paid'
            break
          case 'paid_month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
            matchesDate = invoice.status === 'paid' && 
                         !!invoice.paidDate && 
                         new Date(invoice.paidDate) >= monthAgo
            break
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [invoices, searchTerm, selectedStatus, dateFilter])

  const stats = useMemo(() => {
    const outstanding = invoices.filter(i => ['sent', 'viewed'].includes(i.status))
    const overdue = invoices.filter(i => i.status === 'overdue')
    const paid = invoices.filter(i => i.status === 'paid')
    const paidThisMonth = paid.filter(i => {
      if (!i.paidDate) return false
      const paidDate = new Date(i.paidDate)
      const now = new Date()
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()
    })
    
    const avgDaysToPay = paid.length > 0
      ? paid.reduce((sum, invoice) => {
          if (!invoice.paidDate) return sum
          return sum + differenceInDays(new Date(invoice.paidDate), new Date(invoice.issueDate))
        }, 0) / paid.length
      : 0

    return {
      outstanding: {
        count: outstanding.length,
        value: outstanding.reduce((sum, i) => sum + i.value, 0)
      },
      overdue: {
        count: overdue.length,
        value: overdue.reduce((sum, i) => sum + i.value, 0)
      },
      paidThisMonth: {
        count: paidThisMonth.length,
        value: paidThisMonth.reduce((sum, i) => sum + i.value, 0)
      },
      avgDaysToPay: Math.round(avgDaysToPay)
    }
  }, [invoices])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track payments and manage customer invoices
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          onClick={() => router.push('/dashboard/quotes')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create from Quote
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${stats.outstanding.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{stats.outstanding.count} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.overdue.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{stats.overdue.count} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.paidThisMonth.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{stats.paidThisMonth.count} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg Days to Pay</CardTitle>
              <Timer className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgDaysToPay}</div>
            <p className="text-xs text-muted-foreground">days on average</p>
          </CardContent>
        </Card>
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
        
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Invoices</SelectItem>
            <SelectItem value="overdue">Overdue Only</SelectItem>
            <SelectItem value="due_today">Due Today</SelectItem>
            <SelectItem value="due_week">Due This Week</SelectItem>
            <SelectItem value="paid_month">Paid This Month</SelectItem>
          </SelectContent>
        </Select>

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
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            All invoices synced with Pipedrive deals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-muted-foreground">Complete jobs to generate invoices</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const status = invoiceStatuses[invoice.status]
                const daysOverdue = invoice.status === 'overdue' 
                  ? differenceInDays(new Date(), new Date(invoice.dueDate))
                  : 0
                
                return (
                  <div
                    key={invoice.id}
                    className="p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          invoice.status === 'paid' ? 'bg-green-100' :
                          invoice.status === 'overdue' ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          <Receipt className={`h-5 w-5 sm:h-6 sm:w-6 ${
                            invoice.status === 'paid' ? 'text-green-600' :
                            invoice.status === 'overdue' ? 'text-red-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-sm sm:text-base">{invoice.invoiceNumber}</h4>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                            {daysOverdue > 0 && (
                              <span className="text-xs text-red-600 font-medium">
                                {daysOverdue}d overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invoice.person_id?.name || 'Unknown Customer'}
                            {invoice.org_id && ` • ${invoice.org_id.name}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {invoice.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-2">
                      <div className="text-right">
                        <p className={`font-semibold ${
                          invoice.status === 'paid' ? 'text-green-600' :
                          invoice.status === 'overdue' ? 'text-red-600' :
                          'text-foreground'
                        }`}>
                          ${invoice.value.toLocaleString()}
                        </p>
                        {invoice.paidDate && (
                          <p className="text-xs text-muted-foreground">
                            Paid {format(new Date(invoice.paidDate), 'MMM d')}
                          </p>
                        )}
                      </div>
                        <div className="text-right sm:text-left">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Due {format(new Date(invoice.dueDate), 'MMM d')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedInvoice(invoice)
                              setPaymentData({ ...paymentData, amount: invoice.value.toString() })
                              setShowPaymentDialog(true)
                            }}
                            title="Record Payment"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Download invoice PDF
                            console.log('Download invoice:', invoice.invoiceNumber)
                          }}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              sendReminder(invoice)
                            }}
                            title="Send Reminder"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`https://app.pipedrive.com/deal/${invoice.dealId}`, '_blank')
                          }}
                          title="View in Pipedrive"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => {
            const overdueInvoices = invoices.filter(i => i.status === 'overdue')
            if (overdueInvoices.length > 0) {
              // Send bulk reminders
              overdueInvoices.forEach(invoice => sendReminder(invoice))
            }
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Send Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.overdue.count} overdue invoices
                </p>
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

      {/* Payment Recording Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentData.method} onValueChange={(value) => setPaymentData({ ...paymentData, method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="ach">ACH Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Payment Date</Label>
              <Input
                id="date"
                type="date"
                value={paymentData.date}
                onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any payment notes..."
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={recordPayment} disabled={!paymentData.amount}>
                <Banknote className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}