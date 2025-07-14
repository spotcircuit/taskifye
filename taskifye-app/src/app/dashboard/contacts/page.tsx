'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, UserPlus, Download, Users, Loader2, Search, 
  Phone, Mail, Building, Calendar, DollarSign, TrendingUp,
  Filter, MoreVertical, Edit, Trash2, Eye
} from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'

interface Contact {
  id: number
  name: string
  email?: string[]
  phone?: string[]
  organization?: { name: string }
  add_time: string
  last_activity_date?: string
  deals_count?: number
  won_deals_count?: number
  lost_deals_count?: number
  open_deals_count?: number
  closed_deals_count?: number
  activities_count?: number
  done_activities_count?: number
  label?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'customers' | 'leads'>('all')
  const downloadTemplate = () => {
    const csv = 'name,email,phone,company,source\nJohn Doe,john@example.com,+1234567890,ABC Corp,Website\nJane Smith,jane@example.com,+0987654321,XYZ Inc,Referral'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: ''
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      setLoading(false)
      return
    }

    try {
      const pipedrive = new PipedriveService(apiKey)
      const response = await pipedrive.getPersons()
      
      if (response.success && response.persons) {
        // Transform the data to match our interface
        const transformedContacts = response.persons.map((person: any) => ({
          id: person.id,
          name: person.name,
          email: person.email,
          phone: person.phone,
          organization: person.org_id,
          add_time: person.add_time,
          last_activity_date: person.last_activity_date,
          deals_count: person.open_deals_count + person.closed_deals_count,
          won_deals_count: person.won_deals_count,
          lost_deals_count: person.lost_deals_count,
          open_deals_count: person.open_deals_count,
          closed_deals_count: person.closed_deals_count,
          activities_count: person.activities_count,
          done_activities_count: person.done_activities_count,
          label: person.label
        }))
        setContacts(transformedContacts)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Parse CSV
      const text = await selectedFile.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      const contacts = lines.slice(1).map(line => {
        const values = line.split(',')
        const contact: any = {}
        headers.forEach((header, index) => {
          contact[header] = values[index]?.trim()
        })
        return contact
      }).filter(c => c.name || c.email) // Filter empty rows

      // Upload to Pipedrive
      const apiKey = pipedriveStorage.getApiKey()
      if (!apiKey) {
        alert('Please connect Pipedrive first in the Integrations page')
        return
      }

      const pipedrive = new PipedriveService(apiKey)
      let created = 0
      let failed = 0

      for (const contact of contacts) {
        try {
          const result = await pipedrive.createPerson({
            name: contact.name,
            email: contact.email ? [contact.email] : undefined,
            phone: contact.phone ? [contact.phone] : undefined,
          })
          if (result.success) {
            created++
          } else {
            failed++
          }
        } catch (error) {
          failed++
        }
      }

      const result = { success: true, created, failed }
      if (result.success) {
        alert(`Successfully uploaded ${result.created} contacts! Failed: ${result.failed}`)
        setSelectedFile(null)
        // Refresh the contacts list
        fetchContacts()
      } else {
        alert('Upload failed')
      }
      
    } catch (error) {
      alert('Error processing file: ' + error)
    } finally {
      setUploading(false)
    }
  }

  const quickAddTemplates = [
    { name: 'Web Lead', fields: { source: 'Website', notes: 'Lead from website inquiry' } },
    { name: 'Referral', fields: { source: 'Referral', notes: 'Customer referral' } },
    { name: 'Event Contact', fields: { source: 'Event', notes: 'Met at trade show/event' } },
  ]

  const handleAddContact = async () => {
    if (!newContact.name) {
      alert('Please enter at least a name')
      return
    }

    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      alert('Please connect Pipedrive first in the Integrations page')
      return
    }

    setIsAddingContact(true)
    try {
      const pipedrive = new PipedriveService(apiKey)
      
      // Create organization if company is provided
      let orgId = undefined
      if (newContact.company) {
        try {
          const orgResult = await pipedrive.createOrganization({
            name: newContact.company,
            address: newContact.address
          })
          if (orgResult.success) {
            orgId = orgResult.data.id
          }
        } catch (error) {
          console.log('Organization may already exist:', error)
        }
      }

      const result = await pipedrive.createPerson({
        name: newContact.name,
        email: newContact.email ? [newContact.email] : undefined,
        phone: newContact.phone ? [newContact.phone] : undefined,
        org_id: orgId
      })

      if (result.success) {
        alert('Contact added successfully!')
        setNewContact({
          name: '',
          email: '',
          phone: '',
          company: '',
          address: '',
          notes: ''
        })
        // Refresh the contacts list
        fetchContacts()
      } else {
        alert('Failed to add contact: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Error adding contact: ' + error)
    } finally {
      setIsAddingContact(false)
    }
  }

  const applyTemplate = (template: any) => {
    setNewContact({
      ...newContact,
      notes: template.fields.notes
    })
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.[0]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone?.[0]?.includes(searchTerm)
    
    if (filterType === 'customers') {
      return matchesSearch && (contact.deals_count || 0) > 0
    } else if (filterType === 'leads') {
      return matchesSearch && (contact.deals_count || 0) === 0
    }
    return matchesSearch
  })

  const stats = {
    total: contacts.length,
    customers: contacts.filter(c => (c.deals_count || 0) > 0).length,
    leads: contacts.filter(c => (c.deals_count || 0) === 0).length,
    activeDeals: contacts.reduce((sum, c) => sum + (c.open_deals_count || 0), 0)
  }

  const segments = [
    { id: 'high-value', name: 'High Value', count: contacts.filter(c => (c.won_deals_count || 0) > 2).length, color: 'bg-green-100 text-green-800' },
    { id: 'active', name: 'Active', count: contacts.filter(c => c.last_activity_date && new Date(c.last_activity_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, color: 'bg-blue-100 text-blue-800' },
    { id: 'inactive', name: 'Inactive', count: contacts.filter(c => !c.last_activity_date || new Date(c.last_activity_date) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length, color: 'bg-orange-100 text-orange-800' },
    { id: 'new', name: 'New This Month', count: contacts.filter(c => new Date(c.add_time) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, color: 'bg-purple-100 text-purple-800' },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contacts & Leads</h1>
          <p className="text-muted-foreground mt-2">
            Manage your customer database and track leads
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">{stats.total} Total</Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">{stats.customers} Customers</Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">{stats.leads} Leads</Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilterType('all')}>All Contacts</TabsTrigger>
            <TabsTrigger value="customers" onClick={() => setFilterType('customers')}>Customers</TabsTrigger>
            <TabsTrigger value="leads" onClick={() => setFilterType('leads')}>Leads</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
          </TabsList>
          
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* All Contacts Tab */}
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No contacts found</p>
                <p className="text-muted-foreground">Add your first contact to get started</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Company</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Activity</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Added {new Date(contact.add_time).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            {contact.email?.[0] && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {typeof contact.email[0] === 'string' ? contact.email[0] : (contact.email[0] as any)?.value || contact.email[0]}
                              </div>
                            )}
                            {contact.phone?.[0] && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {typeof contact.phone[0] === 'string' ? contact.phone[0] : (contact.phone[0] as any)?.value || contact.phone[0]}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {contact.organization ? (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {contact.organization.name}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {(contact.deals_count || 0) > 0 ? (
                              <Badge className="bg-green-100 text-green-800">Customer</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">Lead</Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {contact.open_deals_count || 0} deals
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {contact.activities_count || 0} activities
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Total Value</th>
                      <th className="text-left p-4 font-medium">Jobs</th>
                      <th className="text-left p-4 font-medium">Last Activity</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts
                      .filter(c => (c.deals_count || 0) > 0)
                      .map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium">{contact.name}</div>
                            {contact.organization && (
                              <div className="text-sm text-muted-foreground">
                                {contact.organization.name}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {contact.email?.[0] && (
                              <div className="text-sm">{typeof contact.email[0] === 'string' ? contact.email[0] : (contact.email[0] as any)?.value || contact.email[0]}</div>
                            )}
                            {contact.phone?.[0] && (
                              <div className="text-sm">{typeof contact.phone[0] === 'string' ? contact.phone[0] : (contact.phone[0] as any)?.value || contact.phone[0]}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-medium">$0</div>
                            <div className="text-sm text-muted-foreground">
                              Lifetime value
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 text-sm">
                              <Badge variant="outline" className="text-green-600">
                                {contact.won_deals_count || 0} won
                              </Badge>
                              <Badge variant="outline" className="text-blue-600">
                                {contact.open_deals_count || 0} open
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {contact.last_activity_date 
                                ? new Date(contact.last_activity_date).toLocaleDateString()
                                : 'No activity'
                              }
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Lead</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Source</th>
                      <th className="text-left p-4 font-medium">Added</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts
                      .filter(c => (c.deals_count || 0) === 0)
                      .map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium">{contact.name}</div>
                            {contact.organization && (
                              <div className="text-sm text-muted-foreground">
                                {contact.organization.name}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {contact.email?.[0] && (
                              <div className="text-sm">{typeof contact.email[0] === 'string' ? contact.email[0] : (contact.email[0] as any)?.value || contact.email[0]}</div>
                            )}
                            {contact.phone?.[0] && (
                              <div className="text-sm">{typeof contact.phone[0] === 'string' ? contact.phone[0] : (contact.phone[0] as any)?.value || contact.phone[0]}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {contact.label || 'Direct'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {new Date(contact.add_time).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                Convert to Customer
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                    <Badge className={segment.color}>
                      {segment.count} contacts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {segment.id === 'high-value' && 'Customers with 3+ completed jobs'}
                    {segment.id === 'active' && 'Activity within the last 30 days'}
                    {segment.id === 'inactive' && 'No activity for 90+ days'}
                    {segment.id === 'new' && 'Added in the last 30 days'}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="mr-1 h-3 w-3" />
                      Email Campaign
                    </Button>
                    <Button size="sm" variant="outline">
                      View List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Add New Tab */}
        <TabsContent value="add" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
        {/* Bulk Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Import
            </CardTitle>
            <CardDescription>
              Upload a CSV file with your contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : 'Click to upload CSV'}
                  </p>
                </label>
              </div>
              
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload Contacts'}
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={downloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Quick Add
            </CardTitle>
            <CardDescription>
              Add contacts one at a time with templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="ABC Corporation"
                  value={newContact.company}
                  onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Quick Templates:</p>
                {quickAddTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => applyTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>

              <Button 
                className="w-full" 
                onClick={handleAddContact}
                disabled={isAddingContact || !newContact.name}
              >
                {isAddingContact ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Contact'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}