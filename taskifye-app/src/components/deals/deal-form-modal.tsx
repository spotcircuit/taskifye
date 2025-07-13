'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { pipedriveStorage } from '@/lib/integrations/pipedrive'

interface DealTemplate {
  id: string
  name: string
  value: number
  recurring: string
  description: string
  deliverables: string[]
}

interface DealFormModalProps {
  template: DealTemplate
  onClose: () => void
  onSuccess?: () => void
}

export function DealFormModal({ template, onClose, onSuccess }: DealFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: template.name,
    value: template.value,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    notes: template.deliverables.join('\n')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const apiKey = pipedriveStorage.getApiKey()
      if (!apiKey) {
        alert('Please connect Pipedrive first')
        return
      }

      // First create the contact if we have details
      let personId = null
      if (formData.contactName || formData.contactEmail) {
        const personResponse = await fetch('/api/integrations/pipedrive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createPerson',
            apiKey,
            name: formData.contactName,
            email: formData.contactEmail ? [formData.contactEmail] : undefined,
            phone: formData.contactPhone ? [formData.contactPhone] : undefined
          })
        })

        const personResult = await personResponse.json()
        if (personResult.success) {
          personId = personResult.person.id
        }
      }

      // Create the deal
      const dealResponse = await fetch('/api/integrations/pipedrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createDeal',
          apiKey,
          title: formData.title,
          value: formData.value,
          person_id: personId,
          visible_to: '3' // Everyone in company can see
        })
      })

      const dealResult = await dealResponse.json()
      if (dealResult.success) {
        alert('Deal created successfully!')
        onSuccess?.()
        onClose()
      } else {
        alert('Failed to create deal: ' + dealResult.error)
      }
    } catch (error) {
      alert('Error creating deal: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Deal from Template</CardTitle>
              <CardDescription>{template.name}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Deal Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes / Deliverables</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Deal'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}