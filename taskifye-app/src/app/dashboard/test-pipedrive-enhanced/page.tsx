'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PipedriveService } from '@/lib/integrations/pipedrive'
import { Building, Calendar, Users, FileText, DollarSign, Activity } from 'lucide-react'

export default function TestPipedriveEnhancedPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string | null>(null)

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(testName)
    try {
      const result = await testFunction()
      setResults((prev: any) => ({ ...prev, [testName]: result }))
    } catch (error: any) {
      setResults((prev: any) => ({ ...prev, [testName]: { error: error.message } }))
    }
    setLoading(null)
  }

  const testOrganizations = async () => {
    const apiKey = null // API key now comes from database
    if (!apiKey) throw new Error('No API key found')

    const service = new PipedriveService()
    
    // Get organizations
    const orgs = await service.getOrganizations({ limit: 5 })
    
    // Create a test organization
    const newOrg = await service.createOrganization({
      name: 'Test HVAC Company ' + Date.now(),
      address: '123 Main St, City, State 12345'
    })

    return { organizations: orgs, newOrganization: newOrg }
  }

  const testActivities = async () => {
    const apiKey = null // API key now comes from database
    if (!apiKey) throw new Error('No API key found')

    const service = new PipedriveService()
    
    // Get activities
    const activities = await service.getActivities({ done: 0, limit: 5 })
    
    // Create a test activity
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const newActivity = await service.createActivity({
      subject: 'HVAC System Inspection',
      type: 'meeting',
      due_date: tomorrow.toISOString().split('T')[0],
      due_time: '14:00',
      duration: '01:00',
      note: 'Annual maintenance check for AC unit'
    })

    return { activities, newActivity }
  }

  const testDealUpdates = async () => {
    const apiKey = null // API key now comes from database
    if (!apiKey) throw new Error('No API key found')

    const service = new PipedriveService()
    
    // Get stages
    const stages = await service.getStages()
    
    // Get deal fields
    const dealFields = await service.getDealFields()
    
    // Get a deal to update (if any exist)
    const deals = await service.getDeals({ limit: 1 })
    
    let updateResult = null
    if (deals.deals && deals.deals.length > 0) {
      const dealId = deals.deals[0].id
      updateResult = await service.updateDeal(dealId, {
        title: deals.deals[0].title + ' (Updated)',
        value: deals.deals[0].value * 1.1 // 10% increase
      })
    }

    return { stages, dealFields, updateResult }
  }

  const testNotes = async () => {
    const apiKey = null // API key now comes from database
    if (!apiKey) throw new Error('No API key found')

    const service = new PipedriveService()
    
    // Get a deal to add note to
    const deals = await service.getDeals({ limit: 1 })
    
    let noteResult = null
    if (deals.deals && deals.deals.length > 0) {
      const dealId = deals.deals[0].id
      noteResult = await service.addNote('deal', dealId, 
        'Test note: Customer requested quote for new AC unit installation. ' +
        'Property size: 2000 sq ft. Preferred brands: Carrier or Trane.'
      )
    }

    return { noteResult }
  }

  const testCustomFields = async () => {
    const apiKey = null // API key now comes from database
    if (!apiKey) throw new Error('No API key found')

    const service = new PipedriveService()
    
    const personFields = await service.getPersonFields()
    const orgFields = await service.getOrganizationFields()
    
    return { personFields, orgFields }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enhanced Pipedrive Integration Test</h1>
        <p className="text-muted-foreground">
          Test new Pipedrive features: Organizations, Activities, Notes, and Custom Fields
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organizations Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organizations
            </CardTitle>
            <CardDescription>
              Test organization management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('organizations', testOrganizations)}
              disabled={loading === 'organizations'}
            >
              {loading === 'organizations' ? 'Testing...' : 'Test Organizations'}
            </Button>
            {results.organizations && (
              <pre className="mt-4 text-xs overflow-auto max-h-40">
                {JSON.stringify(results.organizations, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Activities Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activities
            </CardTitle>
            <CardDescription>
              Test activity/task management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('activities', testActivities)}
              disabled={loading === 'activities'}
            >
              {loading === 'activities' ? 'Testing...' : 'Test Activities'}
            </Button>
            {results.activities && (
              <pre className="mt-4 text-xs overflow-auto max-h-40">
                {JSON.stringify(results.activities, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Deal Updates Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Deal Management
            </CardTitle>
            <CardDescription>
              Test deal updates and stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('dealUpdates', testDealUpdates)}
              disabled={loading === 'dealUpdates'}
            >
              {loading === 'dealUpdates' ? 'Testing...' : 'Test Deal Updates'}
            </Button>
            {results.dealUpdates && (
              <pre className="mt-4 text-xs overflow-auto max-h-40">
                {JSON.stringify(results.dealUpdates, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Notes Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
            <CardDescription>
              Test adding notes to entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('notes', testNotes)}
              disabled={loading === 'notes'}
            >
              {loading === 'notes' ? 'Testing...' : 'Test Notes'}
            </Button>
            {results.notes && (
              <pre className="mt-4 text-xs overflow-auto max-h-40">
                {JSON.stringify(results.notes, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Custom Fields Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Custom Fields
            </CardTitle>
            <CardDescription>
              Test custom field discovery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('customFields', testCustomFields)}
              disabled={loading === 'customFields'}
            >
              {loading === 'customFields' ? 'Testing...' : 'Test Custom Fields'}
            </Button>
            {results.customFields && (
              <pre className="mt-4 text-xs overflow-auto max-h-40">
                {JSON.stringify(results.customFields, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>What We Can Do Now</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✅ Manage Organizations (companies) separately from contacts</li>
            <li>✅ Create and track Activities (appointments, tasks, calls)</li>
            <li>✅ Update deals with custom fields and move between stages</li>
            <li>✅ Add notes to deals, contacts, or organizations</li>
            <li>✅ Discover and use custom fields for industry-specific data</li>
            <li>✅ Build a complete job tracking system on top of Pipedrive</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}