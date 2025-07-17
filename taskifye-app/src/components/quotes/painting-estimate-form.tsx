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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, Trash2, Calculator, FileText, User, 
  Calendar, DollarSign, Percent, Hash, Package,
  Building, Phone, Mail, MapPin, Search, Loader2,
  Paintbrush, Home, Ruler, Clock, Users, AlertCircle
} from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'
import { format, addDays } from 'date-fns'
import { useRouter } from 'next/navigation'

interface EstimateItem {
  id: string
  category: 'labor' | 'materials' | 'equipment' | 'other'
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
  notes?: string
}

interface PaintingEstimate {
  id: string
  projectName: string
  customerName: string
  customerId: number
  jobAddress: string
  estimateDate: string
  expiryDate: string
  squareFootage: number
  roomCount: number
  surfaceType: string
  paintType: string
  items: EstimateItem[]
  laborHours: number
  laborRate: number
  materialMarkup: number
  profitMargin: number
  salesCommissionRate: number
  notes: string
  internalNotes: string
  status: 'draft' | 'sent' | 'approved' | 'rejected'
}

// Painting-specific service catalog
const paintingCatalog = {
  labor: [
    { id: 'interior-paint', name: 'Interior Painting', price: 2.50, unit: 'sq ft', category: 'labor' },
    { id: 'exterior-paint', name: 'Exterior Painting', price: 3.50, unit: 'sq ft', category: 'labor' },
    { id: 'ceiling-paint', name: 'Ceiling Painting', price: 2.00, unit: 'sq ft', category: 'labor' },
    { id: 'trim-paint', name: 'Trim & Molding', price: 4.00, unit: 'linear ft', category: 'labor' },
    { id: 'cabinet-paint', name: 'Cabinet Painting', price: 75, unit: 'door', category: 'labor' },
    { id: 'deck-stain', name: 'Deck Staining', price: 3.00, unit: 'sq ft', category: 'labor' },
    { id: 'pressure-wash', name: 'Pressure Washing', price: 0.50, unit: 'sq ft', category: 'labor' },
    { id: 'wallpaper-remove', name: 'Wallpaper Removal', price: 1.50, unit: 'sq ft', category: 'labor' },
    { id: 'texture-repair', name: 'Texture Repair', price: 3.00, unit: 'sq ft', category: 'labor' },
    { id: 'drywall-patch', name: 'Drywall Patching', price: 125, unit: 'patch', category: 'labor' }
  ],
  materials: [
    { id: 'premium-paint', name: 'Premium Paint', price: 45, unit: 'gallon', category: 'materials' },
    { id: 'standard-paint', name: 'Standard Paint', price: 30, unit: 'gallon', category: 'materials' },
    { id: 'primer', name: 'Primer', price: 25, unit: 'gallon', category: 'materials' },
    { id: 'caulk', name: 'Caulking', price: 5, unit: 'tube', category: 'materials' },
    { id: 'tape', name: 'Painter\'s Tape', price: 8, unit: 'roll', category: 'materials' },
    { id: 'plastic', name: 'Plastic Sheeting', price: 25, unit: 'roll', category: 'materials' },
    { id: 'drop-cloth', name: 'Drop Cloths', price: 20, unit: 'each', category: 'materials' },
    { id: 'brushes', name: 'Brushes/Rollers', price: 50, unit: 'set', category: 'materials' }
  ],
  equipment: [
    { id: 'sprayer-rental', name: 'Paint Sprayer Rental', price: 150, unit: 'day', category: 'equipment' },
    { id: 'ladder-rental', name: 'Extension Ladder Rental', price: 75, unit: 'day', category: 'equipment' },
    { id: 'scaffolding', name: 'Scaffolding Rental', price: 200, unit: 'day', category: 'equipment' },
    { id: 'lift-rental', name: 'Lift Rental', price: 400, unit: 'day', category: 'equipment' }
  ]
}

export function PaintingEstimateForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showContactSearch, setShowContactSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [estimate, setEstimate] = useState<PaintingEstimate>({
    id: `EST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    projectName: '',
    customerName: '',
    customerId: 0,
    jobAddress: '',
    estimateDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    squareFootage: 0,
    roomCount: 0,
    surfaceType: 'drywall',
    paintType: 'interior',
    items: [],
    laborHours: 0,
    laborRate: 35,
    materialMarkup: 20,
    profitMargin: 35,
    salesCommissionRate: 10,
    notes: '',
    internalNotes: '',
    status: 'draft'
  })

  // Quick calculation helpers
  const calculatePaintNeeded = (sqft: number, coats: number = 2) => {
    const coveragePerGallon = 350 // Average coverage
    return Math.ceil((sqft * coats) / coveragePerGallon)
  }

  const calculateLaborHours = (sqft: number, roomCount: number) => {
    // Base hours per sq ft + setup time per room
    const hoursPerSqFt = 0.01
    const setupPerRoom = 2
    return Math.round((sqft * hoursPerSqFt) + (roomCount * setupPerRoom))
  }

  // Auto-calculate when square footage changes
  useEffect(() => {
    if (estimate.squareFootage > 0) {
      const laborHours = calculateLaborHours(estimate.squareFootage, estimate.roomCount)
      setEstimate(prev => ({ ...prev, laborHours }))
    }
  }, [estimate.squareFootage, estimate.roomCount])

  const searchContacts = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey || !searchTerm) return

    setSearching(true)
    try {
      const pipedrive = new PipedriveService(apiKey)
      const response = await pipedrive.getContacts({ term: searchTerm })
      if (response.success && response.contacts) {
        setContacts(response.contacts)
      }
    } catch (error) {
      console.error('Error searching contacts:', error)
    } finally {
      setSearching(false)
    }
  }

  const addEstimateItem = (item: any) => {
    const newItem: EstimateItem = {
      id: `item-${Date.now()}`,
      category: item.category,
      description: item.name,
      quantity: 1,
      unit: item.unit,
      unitPrice: item.price,
      total: item.price
    }
    setEstimate(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
    setEstimate(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    }))
  }

  const removeItem = (id: string) => {
    setEstimate(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  // Calculate totals
  const calculateTotals = () => {
    const laborTotal = estimate.items
      .filter(i => i.category === 'labor')
      .reduce((sum, item) => sum + item.total, 0)
    
    const materialSubtotal = estimate.items
      .filter(i => i.category === 'materials')
      .reduce((sum, item) => sum + item.total, 0)
    
    const materialTotal = materialSubtotal * (1 + estimate.materialMarkup / 100)
    
    const equipmentTotal = estimate.items
      .filter(i => i.category === 'equipment')
      .reduce((sum, item) => sum + item.total, 0)
    
    const otherTotal = estimate.items
      .filter(i => i.category === 'other')
      .reduce((sum, item) => sum + item.total, 0)
    
    const subtotal = laborTotal + materialTotal + equipmentTotal + otherTotal
    const profitAmount = subtotal * (estimate.profitMargin / 100)
    const total = subtotal + profitAmount
    const commission = total * (estimate.salesCommissionRate / 100)

    return {
      laborTotal,
      materialSubtotal,
      materialTotal,
      equipmentTotal,
      otherTotal,
      subtotal,
      profitAmount,
      total,
      commission
    }
  }

  const saveEstimate = async () => {
    if (!selectedContact) {
      alert('Please select a customer')
      return
    }

    setLoading(true)
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      alert('Pipedrive API key not configured')
      setLoading(false)
      return
    }

    try {
      const pipedrive = new PipedriveService(apiKey)
      const totals = calculateTotals()
      
      // Create or update deal in Pipedrive
      const dealData = {
        title: `${estimate.projectName} - ${selectedContact.name}`,
        person_id: selectedContact.id,
        value: totals.total,
        currency: 'USD',
        stage_id: 1, // Assuming stage 1 is "Estimate"
        expected_close_date: estimate.expiryDate,
        // Store estimate data in deal notes or custom fields
      }

      let dealId = selectedDeal?.id
      if (!dealId) {
        const dealResponse = await pipedrive.createDeal(dealData)
        if (dealResponse.success) {
          dealId = dealResponse.deal.id
        }
      } else {
        await pipedrive.updateDeal(dealId, { value: totals.total })
      }

      if (dealId) {
        // Store full estimate details in deal note
        const estimateNote = `
PAINTING ESTIMATE #${estimate.id}
=================================
Project: ${estimate.projectName}
Location: ${estimate.jobAddress}
Square Footage: ${estimate.squareFootage} sq ft
Rooms: ${estimate.roomCount}
Surface Type: ${estimate.surfaceType}
Paint Type: ${estimate.paintType}

ITEMIZED COSTS:
${estimate.items.map(item => 
  `${item.description}: ${item.quantity} ${item.unit} @ $${item.unitPrice}/${item.unit} = $${item.total.toFixed(2)}`
).join('\n')}

SUMMARY:
Labor: $${totals.laborTotal.toFixed(2)}
Materials (with ${estimate.materialMarkup}% markup): $${totals.materialTotal.toFixed(2)}
Equipment: $${totals.equipmentTotal.toFixed(2)}
Other: $${totals.otherTotal.toFixed(2)}
Subtotal: $${totals.subtotal.toFixed(2)}
Profit (${estimate.profitMargin}%): $${totals.profitAmount.toFixed(2)}
TOTAL: $${totals.total.toFixed(2)}

Commission (${estimate.salesCommissionRate}%): $${totals.commission.toFixed(2)}

Notes: ${estimate.notes}
Internal Notes: ${estimate.internalNotes}

Valid Until: ${format(new Date(estimate.expiryDate), 'PPP')}
        `

        await pipedrive.addNote('deal', dealId, estimateNote)
        
        alert('Estimate saved successfully!')
        router.push('/dashboard/quotes')
      }
    } catch (error) {
      console.error('Error saving estimate:', error)
      alert('Failed to save estimate')
    } finally {
      setLoading(false)
    }
  }

  const approveAndConvertToQuickBooks = async () => {
    // This would integrate with QuickBooks API
    // For now, we'll just update the status
    setEstimate(prev => ({ ...prev, status: 'approved' }))
    
    // In real implementation:
    // 1. Create QuickBooks invoice
    // 2. Set up job costing
    // 3. Calculate commission
    // 4. Update Pipedrive deal stage
    
    alert('Estimate approved! QuickBooks integration would create invoice here.')
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create Painting Estimate</h1>
          <p className="text-muted-foreground mt-2">
            Professional painting estimates with automated calculations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/quotes')}>
            Cancel
          </Button>
          <Button onClick={saveEstimate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Estimate
          </Button>
          {estimate.status === 'sent' && (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={approveAndConvertToQuickBooks}
            >
              Approve & Create Invoice
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer & Project Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Customer</Label>
                {selectedContact ? (
                  <div className="p-3 border rounded-lg bg-accent/50">
                    <p className="font-medium">{selectedContact.name}</p>
                    {selectedContact.organization && (
                      <p className="text-sm text-muted-foreground">{selectedContact.organization.name}</p>
                    )}
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => setShowContactSearch(true)}
                      className="p-0 h-auto mt-1"
                    >
                      Change customer
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowContactSearch(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Select Customer
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Job Address</Label>
                <Textarea 
                  placeholder="Enter job site address..."
                  value={estimate.jobAddress}
                  onChange={(e) => setEstimate(prev => ({ ...prev, jobAddress: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input 
                  placeholder="e.g., Smith Residence - Interior"
                  value={estimate.projectName}
                  onChange={(e) => setEstimate(prev => ({ ...prev, projectName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Square Footage</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={estimate.squareFootage || ''}
                    onChange={(e) => setEstimate(prev => ({ 
                      ...prev, 
                      squareFootage: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room Count</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={estimate.roomCount || ''}
                    onChange={(e) => setEstimate(prev => ({ 
                      ...prev, 
                      roomCount: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Surface Type</Label>
                <Select 
                  value={estimate.surfaceType} 
                  onValueChange={(value) => setEstimate(prev => ({ ...prev, surfaceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drywall">Drywall</SelectItem>
                    <SelectItem value="plaster">Plaster</SelectItem>
                    <SelectItem value="wood">Wood</SelectItem>
                    <SelectItem value="brick">Brick</SelectItem>
                    <SelectItem value="stucco">Stucco</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Paint Type</Label>
                <Select 
                  value={estimate.paintType} 
                  onValueChange={(value) => setEstimate(prev => ({ ...prev, paintType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="both">Interior & Exterior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {estimate.squareFootage > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                  <p className="text-sm font-medium">Quick Calculations:</p>
                  <p className="text-xs">Paint needed: ~{calculatePaintNeeded(estimate.squareFootage)} gallons</p>
                  <p className="text-xs">Estimated hours: ~{estimate.laborHours} hours</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Labor Rate ($/hour)</Label>
                <Input 
                  type="number"
                  value={estimate.laborRate}
                  onChange={(e) => setEstimate(prev => ({ 
                    ...prev, 
                    laborRate: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Material Markup %</Label>
                <Input 
                  type="number"
                  value={estimate.materialMarkup}
                  onChange={(e) => setEstimate(prev => ({ 
                    ...prev, 
                    materialMarkup: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Profit Margin %</Label>
                <Input 
                  type="number"
                  value={estimate.profitMargin}
                  onChange={(e) => setEstimate(prev => ({ 
                    ...prev, 
                    profitMargin: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Sales Commission %</Label>
                <Input 
                  type="number"
                  value={estimate.salesCommissionRate}
                  onChange={(e) => setEstimate(prev => ({ 
                    ...prev, 
                    salesCommissionRate: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Line Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Estimate Line Items</CardTitle>
              <CardDescription>
                Add labor, materials, and equipment to build your estimate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="labor">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="labor">Labor</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="labor" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {paintingCatalog.labor.map((item) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addEstimateItem(item)}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {item.name} (${item.price}/{item.unit})
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {paintingCatalog.materials.map((item) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addEstimateItem(item)}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {item.name} (${item.price}/{item.unit})
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="equipment" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {paintingCatalog.equipment.map((item) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addEstimateItem(item)}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {item.name} (${item.price}/{item.unit})
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newItem: EstimateItem = {
                        id: `item-${Date.now()}`,
                        category: 'other',
                        description: 'Custom Item',
                        quantity: 1,
                        unit: 'each',
                        unitPrice: 0,
                        total: 0
                      }
                      setEstimate(prev => ({
                        ...prev,
                        items: [...prev.items, newItem]
                      }))
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Item
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Line Items Table */}
              {estimate.items.length > 0 && (
                <div className="mt-6">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                          <th className="px-4 py-2 text-center text-sm font-medium">Qty</th>
                          <th className="px-4 py-2 text-center text-sm font-medium">Unit</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">Price</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimate.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-2">
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                className="border-0 p-0 h-auto"
                              />
                              <Badge variant="outline" className="mt-1">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 w-20">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </td>
                            <td className="px-4 py-2 w-24">
                              <Input
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                className="text-center"
                              />
                            </td>
                            <td className="px-4 py-2 w-28">
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="text-right"
                              />
                            </td>
                            <td className="px-4 py-2 text-right font-medium">
                              ${item.total.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Labor Total:</span>
                  <span>${totals.laborTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Materials (before markup):</span>
                  <span>${totals.materialSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Materials (with {estimate.materialMarkup}% markup):</span>
                  <span>${totals.materialTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Equipment Total:</span>
                  <span>${totals.equipmentTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Other:</span>
                  <span>${totals.otherTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Profit ({estimate.profitMargin}%):</span>
                  <span>${totals.profitAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">${totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Commission ({estimate.salesCommissionRate}%):</span>
                  <span>${totals.commission.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Customer Notes</Label>
                  <Textarea
                    placeholder="Notes that will appear on the estimate..."
                    value={estimate.notes}
                    onChange={(e) => setEstimate(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea
                    placeholder="Internal notes (not shown to customer)..."
                    value={estimate.internalNotes}
                    onChange={(e) => setEstimate(prev => ({ ...prev, internalNotes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Search Dialog */}
      <Dialog open={showContactSearch} onOpenChange={setShowContactSearch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Search for an existing customer or create a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchContacts()}
              />
              <Button onClick={searchContacts} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact)
                    setEstimate(prev => ({ 
                      ...prev, 
                      customerName: contact.name,
                      customerId: contact.id
                    }))
                    setShowContactSearch(false)
                  }}
                  className="w-full p-3 text-left hover:bg-accent rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      {contact.organization && (
                        <p className="text-sm text-muted-foreground">{contact.organization.name}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
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