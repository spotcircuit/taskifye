'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, Filter, FileText, Clock, CheckCircle, 
  XCircle, DollarSign, Calendar, User, MoreVertical,
  Send, Download, Copy, Search, Loader2, ExternalLink,
  TrendingUp, AlertCircle, Eye, Paintbrush
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PipedriveService } from '@/lib/integrations/pipedrive'
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { useIntegrations } from '@/contexts/integrations-context'

interface Quote {
  id: number
  title: string
  person_id?: { name: string; value: number }
  org_id?: { name: string; value: number }
  value: number
  currency: string
  status: string
  stage_id: number
  add_time: string
  update_time: string
  expected_close_date?: string
  // Quote-specific data would be in notes or custom fields
  quoteNumber?: string
  quoteStatus?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
}

const quoteStatuses = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
}

export function QuotesList() {
  const router = useRouter()
  const { status, isLoading: integrationsLoading } = useIntegrations()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    if (!integrationsLoading && status.pipedrive) {
      fetchQuotes()
    } else if (!integrationsLoading) {
      setLoading(false)
    }
  }, [integrationsLoading, status.pipedrive])

  const fetchQuotes = async () => {
    if (!status.pipedrive) {
      setLoading(false)
      return
    }

    try {
      const pipedrive = new PipedriveService()
      // Fetch deals that represent quotes
      // In a real implementation, you'd filter by a specific pipeline or stage
      const response = await pipedrive.getDeals({ status: 'all_not_deleted' })
      
      if (response.success && response.deals) {
        // Filter deals that have "Quote" in the title or are in specific stages
        const quotesData = response.deals
          .filter((deal: any) => 
            deal.title.toLowerCase().includes('quote') || 
            deal.stage_id <= 3 // Assuming early stages are for quotes
          )
          .map((deal: any) => ({
            ...deal,
            // Extract quote number from title if available
            quoteNumber: deal.title.match(/Q-\d{4}-\d{3}/)?.[0] || `Q-${deal.id}`,
            // Determine quote status based on stage or other criteria
            quoteStatus: determineQuoteStatus(deal)
          }))
        
        setQuotes(quotesData)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const determineQuoteStatus = (deal: any): 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' => {
    // This is a simplified logic - in real implementation, you'd use custom fields
    if (deal.status === 'won') return 'accepted'
    if (deal.status === 'lost') return 'rejected'
    if (deal.expected_close_date && isBefore(new Date(deal.expected_close_date), new Date())) return 'expired'
    if (deal.stage_id === 1) return 'draft'
    if (deal.stage_id === 2) return 'sent'
    return 'viewed'
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.person_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.org_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || quote.quoteStatus === selectedStatus
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const quoteDate = new Date(quote.add_time)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          matchesDate = isAfter(quoteDate, startOfDay(now)) && isBefore(quoteDate, endOfDay(now))
          break
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          matchesDate = isAfter(quoteDate, weekAgo)
          break
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
          matchesDate = isAfter(quoteDate, monthAgo)
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const stats = {
    total: quotes.length,
    totalValue: quotes.reduce((sum, q) => sum + (q.value || 0), 0),
    pending: quotes.filter(q => ['sent', 'viewed'].includes(q.quoteStatus || '')).length,
    pendingValue: quotes
      .filter(q => ['sent', 'viewed'].includes(q.quoteStatus || ''))
      .reduce((sum, q) => sum + (q.value || 0), 0),
    accepted: quotes.filter(q => q.quoteStatus === 'accepted').length,
    acceptedValue: quotes
      .filter(q => q.quoteStatus === 'accepted')
      .reduce((sum, q) => sum + (q.value || 0), 0),
    conversionRate: quotes.length > 0 
      ? (quotes.filter(q => q.quoteStatus === 'accepted').length / quotes.length) * 100
      : 0
  }

  const handleViewQuote = (quote: Quote) => {
    // In a real implementation, this would navigate to a quote detail page
    router.push(`/dashboard/quotes/${quote.id}`)
  }

  const handleDownloadQuote = async (quote: Quote) => {
    // In a real implementation, this would generate and download a PDF
    console.log('Download quote:', quote.quoteNumber)
  }

  const handleDuplicateQuote = async (quote: Quote) => {
    // In a real implementation, this would create a copy of the quote
    router.push(`/dashboard/quotes/new?duplicate=${quote.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Create and manage service quotes for customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="sm:size-default"
            onClick={() => router.push('/dashboard/estimates/painting')}
          >
            <Paintbrush className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Painting Estimate</span>
            <span className="sm:hidden">Painting</span>
          </Button>
          <Button 
            className="sm:size-default bg-blue-600 hover:bg-blue-700"
            size="sm"
            onClick={() => router.push('/dashboard/quotes/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">General Quote</span>
            <span className="sm:hidden">General</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.totalValue.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.pendingValue.toLocaleString()} value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.acceptedValue.toLocaleString()} won
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Quote to sale ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 flex-wrap">
          {Object.entries(quoteStatuses).map(([key, status]) => (
            <Button
              key={key}
              variant={selectedStatus === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(selectedStatus === key ? null : key)}
              className="flex-shrink-0"
            >
              <status.icon className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{status.label}</span>
              <span className="sm:hidden text-xs">{status.label.slice(0, 3)}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>Quote History</CardTitle>
          <CardDescription>
            All quotes synced with Pipedrive deals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Loading quotes...</p>
            </div>
          ) : !status.pipedrive ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Pipedrive Not Connected</p>
              <p className="text-muted-foreground">Connect Pipedrive to manage quotes</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/dashboard/integrations')}
              >
                Configure Integrations
              </Button>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No quotes found</p>
              <p className="text-muted-foreground">Create your first quote to get started</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/dashboard/quotes/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Quote
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => {
                const status = quoteStatuses[quote.quoteStatus as keyof typeof quoteStatuses] || quoteStatuses.draft
                
                return (
                  <div
                    key={quote.id}
                    className="p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleViewQuote(quote)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-sm sm:text-base">{quote.quoteNumber}</h4>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {quote.person_id?.name || 'Unknown Customer'}
                            {quote.org_id && ` • ${quote.org_id.name}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {quote.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div className="flex gap-4 sm:gap-6">
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-green-600">
                              ${quote.value?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(quote.add_time), 'MMM d, yyyy')}
                            </p>
                          </div>
                          {quote.expected_close_date && (
                            <div className="text-left sm:text-right">
                              <p className="text-xs sm:text-sm">Valid until</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(quote.expected_close_date), 'MMM d')}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadQuote(quote)
                            }}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateQuote(quote)
                            }}
                            title="Duplicate Quote"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Open in Pipedrive
                              window.open(`https://app.pipedrive.com/deal/${quote.id}`, '_blank')
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
    </div>
  )
}