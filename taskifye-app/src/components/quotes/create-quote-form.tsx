'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Trash2, Calculator, FileText, User, 
  Calendar, DollarSign, Percent, Hash, Package,
  Building, Phone, Mail, MapPin, Search, Loader2
} from 'lucide-react'
import { PipedriveService } from '@/lib/integrations/pipedrive'
import { format, addDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useIntegrations } from '@/contexts/integrations-context'

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Contact {
  id: number
  name: string
  email?: string[]
  phone?: string[]
  organization?: { name: string; value: number }
}

interface Deal {
  id: number
  title: string
  person_id?: { name: string; value: number }
  org_id?: { name: string; value: number }
  value: number
}

// Service catalog for HVAC/Field Service
const serviceCatalog = [
  { id: 'ac-install', name: 'AC Unit Installation', price: 3500, category: 'Installation' },
  { id: 'furnace-install', name: 'Furnace Installation', price: 4200, category: 'Installation' },
  { id: 'hvac-maintenance', name: 'HVAC Maintenance', price: 150, category: 'Maintenance' },
  { id: 'ac-repair', name: 'AC Repair (Labor)', price: 125, category: 'Repair' },
  { id: 'furnace-repair', name: 'Furnace Repair (Labor)', price: 125, category: 'Repair' },
  { id: 'duct-cleaning', name: 'Duct Cleaning', price: 350, category: 'Maintenance' },
  { id: 'thermostat-install', name: 'Smart Thermostat Installation', price: 250, category: 'Installation' },
  { id: 'refrigerant-recharge', name: 'Refrigerant Recharge', price: 200, category: 'Repair' },
  { id: 'blower-motor', name: 'Blower Motor Replacement', price: 450, category: 'Parts' },
  { id: 'capacitor', name: 'Capacitor Replacement', price: 225, category: 'Parts' },
  { id: 'service-call', name: 'Service Call Fee', price: 75, category: 'Service' },
  { id: 'emergency-fee', name: 'Emergency Service Fee', price: 150, category: 'Service' },
]

export function CreateQuoteForm({ dealId }: { dealId?: number }) {
  const router = useRouter()
  const { status: integrationStatus, isLoading: integrationsLoading } = useIntegrations()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showContactDialog, setShowContactDialog] = useState(false)
  
  const [quoteData, setQuoteData] = useState({
    quoteNumber: `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    date: format(new Date(), 'yyyy-MM-dd'),
    validUntil: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    terms: 'Net 30',
    notes: '',
    discount: 0,
    tax: 8.5,
  })

  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ])

  useEffect(() => {
    if (!integrationsLoading && integrationStatus.pipedrive) {
      fetchContacts()
      if (dealId) {
        fetchDealDetails(dealId)
      }
    }
  }, [dealId, integrationsLoading, integrationStatus.pipedrive])

  const fetchContacts = async () => {
    if (!integrationStatus.pipedrive) return

    setLoading(true)
    try {
      const pipedrive = new PipedriveService()
      const response = await pipedrive.getPersons()
      if (response.success && response.persons) {
        setContacts(response.persons)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDealDetails = async (id: number) => {
    if (!integrationStatus.pipedrive) return

    try {
      const pipedrive = new PipedriveService()
      const response = await pipedrive.getDeals({ id })
      if (response.success && response.deals?.[0]) {
        const deal = response.deals[0]
        setSelectedDeal(deal)
        
        // Auto-select contact from deal
        if (deal.person_id) {
          const contact = contacts.find(c => c.id === deal.person_id.value)
          if (contact) setSelectedContact(contact)
        }
      }
    } catch (error) {
      console.error('Error fetching deal:', error)
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    }))
  }

  const selectServiceFromCatalog = (id: string, service: any) => {
    updateItem(id, 'description', service.name)
    updateItem(id, 'unitPrice', service.price)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateDiscount = () => {
    return (calculateSubtotal() * quoteData.discount) / 100
  }

  const calculateTax = () => {
    const afterDiscount = calculateSubtotal() - calculateDiscount()
    return (afterDiscount * quoteData.tax) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax()
  }

  const saveQuote = async (status: 'draft' | 'sent' = 'draft') => {
    if (!selectedContact) {
      alert('Please select a customer')
      return
    }

    if (items.filter(item => item.description && item.total > 0).length === 0) {
      alert('Please add at least one item to the quote')
      return
    }

    setSaving(true)
    try {
      if (!integrationStatus.pipedrive) {
        alert('Please connect Pipedrive first')
        return
      }

      const pipedrive = new PipedriveService()
      
      // Create or update deal
      const dealData = {
        title: `Quote ${quoteData.quoteNumber} - ${selectedContact.name}`,
        person_id: selectedContact.id,
        org_id: selectedContact.organization?.value,
        value: calculateTotal(),
        currency: 'USD',
        status: 'open',
      }

      let dealId = selectedDeal?.id
      if (!dealId) {
        const dealResponse = await pipedrive.createDeal(dealData)
        if (dealResponse.success) {
          dealId = dealResponse.deal.id
        }
      } else {
        await pipedrive.updateDeal(dealId, { value: calculateTotal() })
      }

      // Add note with quote details
      if (dealId) {
        const quoteDetails = `
Quote #${quoteData.quoteNumber}
Date: ${quoteData.date}
Valid Until: ${quoteData.validUntil}

Items:
${items.filter(item => item.description).map(item => 
  `- ${item.description}: ${item.quantity} x $${item.unitPrice} = $${item.total}`
).join('\n')}

Subtotal: $${calculateSubtotal().toFixed(2)}
Discount (${quoteData.discount}%): -$${calculateDiscount().toFixed(2)}
Tax (${quoteData.tax}%): $${calculateTax().toFixed(2)}
Total: $${calculateTotal().toFixed(2)}

Terms: ${quoteData.terms}
${quoteData.notes ? `Notes: ${quoteData.notes}` : ''}

Status: ${status === 'sent' ? 'Sent to customer' : 'Draft'}
        `
        
        await pipedrive.addNote('deal', dealId, quoteDetails)
      }

      alert(`Quote ${status === 'sent' ? 'sent' : 'saved'} successfully!`)
      router.push('/dashboard/quotes')
      
    } catch (error) {
      console.error('Error saving quote:', error)
      alert('Failed to save quote')
    } finally {
      setSaving(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.[0]?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Select or search for a customer</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedContact ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedContact.name}</p>
                  {selectedContact.organization && (
                    <p className="text-sm text-muted-foreground">{selectedContact.organization.name}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {selectedContact.email?.[0] && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {typeof selectedContact.email[0] === 'string' ? selectedContact.email[0] : (selectedContact.email[0] as any).value}
                      </span>
                    )}
                    {selectedContact.phone?.[0] && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {typeof selectedContact.phone[0] === 'string' ? selectedContact.phone[0] : (selectedContact.phone[0] as any).value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowContactDialog(true)}>
                Change
              </Button>
            </div>
          ) : (
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Select Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select Customer</DialogTitle>
                  <DialogDescription>Choose a customer for this quote</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {loading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No customers found</p>
                    ) : (
                      filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setSelectedContact(contact)
                            setShowContactDialog(false)
                          }}
                        >
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{contact.name}</p>
                            {contact.organization && (
                              <p className="text-sm text-muted-foreground">{contact.organization.name}</p>
                            )}
                          </div>
                          {(contact as any).deals_count > 0 && (
                            <Badge variant="secondary">{(contact as any).deals_count} deals</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* Quote Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
          <CardDescription>Basic quote information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quoteNumber">Quote Number</Label>
              <Input
                id="quoteNumber"
                value={quoteData.quoteNumber}
                onChange={(e) => setQuoteData({ ...quoteData, quoteNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={quoteData.date}
                onChange={(e) => setQuoteData({ ...quoteData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={quoteData.validUntil}
                onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Payment Terms</Label>
              <Select value={quoteData.terms} onValueChange={(value) => setQuoteData({ ...quoteData, terms: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items & Services</CardTitle>
          <CardDescription>Add products and services to the quote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-12 md:col-span-5">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Package className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Service Catalog</DialogTitle>
                          <DialogDescription>Select from common services</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[400px] overflow-y-auto space-y-2">
                          {Object.entries(
                            serviceCatalog.reduce((acc, service) => {
                              if (!acc[service.category]) acc[service.category] = []
                              acc[service.category].push(service)
                              return acc
                            }, {} as Record<string, typeof serviceCatalog>)
                          ).map(([category, services]) => (
                            <div key={category}>
                              <h4 className="font-medium text-sm mb-2">{category}</h4>
                              <div className="space-y-1 mb-4">
                                {services.map((service) => (
                                  <div
                                    key={service.id}
                                    className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
                                    onClick={() => {
                                      selectServiceFromCatalog(item.id, service)
                                    }}
                                  >
                                    <span className="text-sm">{service.name}</span>
                                    <span className="text-sm font-medium">${service.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="text-right"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </div>
                <div className="col-span-3 md:col-span-2 text-right pt-2">
                  <span className="font-medium">${item.total.toFixed(2)}</span>
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addItem} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary & Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Terms & Conditions</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes or terms..."
                  value={quoteData.notes}
                  onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm flex-1">Discount</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={quoteData.discount}
                    onChange={(e) => setQuoteData({ ...quoteData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right"
                  />
                  <span className="text-sm">%</span>
                  <span className="text-sm w-20 text-right">-${calculateDiscount().toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm flex-1">Tax</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={quoteData.tax}
                    onChange={(e) => setQuoteData({ ...quoteData, tax: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right"
                  />
                  <span className="text-sm">%</span>
                  <span className="text-sm w-20 text-right">${calculateTax().toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  onClick={() => saveQuote('sent')}
                  disabled={saving || !selectedContact}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Save & Send Quote
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => saveQuote('draft')}
                  disabled={saving || !selectedContact}
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}