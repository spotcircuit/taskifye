'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, UserPlus, Download, Users } from 'lucide-react'
import { PipedriveService, pipedriveStorage } from '@/lib/integrations/pipedrive'

export default function ContactsPage() {
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

      const response = await fetch('/api/integrations/pipedrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkCreatePersons',
          apiKey,
          persons: contacts
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(`Successfully uploaded ${result.created} contacts! Failed: ${result.failed}`)
        setSelectedFile(null)
      } else {
        alert('Upload failed: ' + result.error)
      }
      
    } catch (error) {
      alert('Error processing file: ' + error)
    } finally {
      setUploading(false)
    }
  }

  const quickAddTemplates = [
    { name: 'Web Lead', fields: { source: 'Website', tags: ['hot-lead'] } },
    { name: 'Referral', fields: { source: 'Referral', tags: ['referral'] } },
    { name: 'Event Contact', fields: { source: 'Event', tags: ['event'] } },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <p className="text-muted-foreground">
          Import contacts and manage your customer database
        </p>
      </div>

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
              <input
                type="text"
                placeholder="Name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Quick Templates:</p>
                {quickAddTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>

              <Button className="w-full">Add Contact</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Imports */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Imports
          </CardTitle>
          <CardDescription>
            Track your contact upload history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Website Leads - March</p>
                <p className="text-muted-foreground">247 contacts • 2 hours ago</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            <div className="flex justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Trade Show Contacts</p>
                <p className="text-muted-foreground">89 contacts • Yesterday</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}