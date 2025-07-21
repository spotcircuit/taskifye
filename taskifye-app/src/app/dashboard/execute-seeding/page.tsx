'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, Loader2, CheckCircle, AlertCircle, Play,
  Building, Users, Briefcase, Calendar
} from 'lucide-react'
import { PipedriveService } from '@/lib/integrations/pipedrive'
import { useIntegrations } from '@/contexts/integrations-context'

interface SeedingProgress {
  step: string
  current: number
  total: number
  message: string
  completed: boolean
}

export default function ExecuteSeedingPage() {
  const { status, isLoading: integrationsLoading } = useIntegrations()
  const [isSeeding, setIsSeeding] = useState(false)
  const [progress, setProgress] = useState<SeedingProgress>({
    step: 'Ready',
    current: 0,
    total: 0,
    message: 'Click Execute to start seeding data',
    completed: false
  })
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const sampleData = {
    organizations: [
      { name: 'Prime Properties LLC', type: 'Property Management', address: '1234 Oak Ave, Austin, TX 78701' },
      { name: 'Metro Office Centers', type: 'Commercial Office', address: '5678 Main St, Houston, TX 77001' },
      { name: 'Sunset Mall Management', type: 'Retail Center', address: '9012 Park Blvd, Dallas, TX 75201' },
      { name: 'Industrial Solutions Inc', type: 'Manufacturing', address: '3456 First St, San Antonio, TX 78201' },
      { name: 'Valley Medical Group', type: 'Healthcare', address: '7890 Cedar Ln, Fort Worth, TX 76101' },
      { name: 'Lincoln School District', type: 'Education', address: '2345 Elm St, El Paso, TX 79901' },
      { name: 'Golden Gate Restaurants', type: 'Restaurant Chain', address: '6789 Maple Ave, Arlington, TX 76001' },
      { name: 'Riverside Apartments', type: 'Residential', address: '1357 Pine St, Corpus Christi, TX 78401' },
      { name: 'Grand Hotel Group', type: 'Hospitality', address: '2468 Second Ave, Plano, TX 75001' },
      { name: 'Texas Tech Hub', type: 'Technology', address: '9876 Third St, Lubbock, TX 79401' }
    ],
    persons: [
      { first: 'John', last: 'Smith', title: 'Facility Manager' },
      { first: 'Sarah', last: 'Johnson', title: 'Property Manager' },
      { first: 'Michael', last: 'Williams', title: 'Maintenance Director' },
      { first: 'Lisa', last: 'Brown', title: 'Operations Manager' },
      { first: 'David', last: 'Jones', title: 'Building Owner' },
      { first: 'Jennifer', last: 'Garcia', title: 'General Manager' },
      { first: 'Robert', last: 'Miller', title: 'Site Supervisor' },
      { first: 'Emily', last: 'Davis', title: 'Office Manager' },
      { first: 'James', last: 'Rodriguez', title: 'Facilities Coordinator' },
      { first: 'Jessica', last: 'Martinez', title: 'Property Owner' },
      { first: 'William', last: 'Hernandez', title: 'Regional Manager' },
      { first: 'Ashley', last: 'Lopez', title: 'Administrative Assistant' },
      { first: 'Richard', last: 'Gonzalez', title: 'Operations Director' },
      { first: 'Amanda', last: 'Wilson', title: 'Building Superintendent' },
      { first: 'Thomas', last: 'Anderson', title: 'Project Manager' }
    ],
    services: [
      { type: 'HVAC Installation', baseValue: 8000, duration: '8-12 hours' },
      { type: 'HVAC Repair', baseValue: 450, duration: '2-4 hours' },
      { type: 'HVAC Maintenance', baseValue: 200, duration: '1-2 hours' },
      { type: 'Heating System Repair', baseValue: 350, duration: '2-3 hours' },
      { type: 'Air Conditioning Service', baseValue: 300, duration: '1-3 hours' },
      { type: 'Ductwork Installation', baseValue: 3500, duration: '6-10 hours' },
      { type: 'Thermostat Installation', baseValue: 250, duration: '1 hour' },
      { type: 'Indoor Air Quality Service', baseValue: 800, duration: '2-4 hours' },
      { type: 'Heat Pump Service', baseValue: 400, duration: '2-3 hours' },
      { type: 'Boiler Repair', baseValue: 600, duration: '3-5 hours' },
      { type: 'Emergency HVAC Service', baseValue: 750, duration: '1-4 hours' },
      { type: 'Commercial HVAC Service', baseValue: 12000, duration: '1-3 days' }
    ]
  }

  const generatePhone = () => {
    const areaCodes = ['512', '713', '214', '210', '817', '915', '469', '361']
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)]
    const exchange = Math.floor(Math.random() * 900) + 100
    const number = Math.floor(Math.random() * 9000) + 1000
    return `(${areaCode}) ${exchange}-${number}`
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const executeSeedingNow = async () => {
    if (!status.pipedrive) {
      setError('Please connect to Pipedrive first from the Integrations page')
      return
    }

    setIsSeeding(true)
    setError(null)
    setResults(null)

    try {
      const pipedrive = new PipedriveService()
      
      // Test API connection first
      console.log('🔍 Testing API connection...')
      setProgress({
        step: 'Testing API',
        current: 0,
        total: 1,
        message: 'Verifying Pipedrive API connection...',
        completed: false
      })
      
      const testResponse = await pipedrive.testConnection()
      if (!testResponse.success) {
        throw new Error('API connection failed - please check your Pipedrive API key')
      }
      
      console.log('✅ API connection successful')
      
      const createdData = {
        organizations: [] as any[],
        persons: [] as any[],
        deals: [] as any[],
        activities: [] as any[]
      }

      // Step 1: Create Organizations
      setProgress({
        step: 'Organizations',
        current: 0,
        total: sampleData.organizations.length,
        message: 'Creating organizations...',
        completed: false
      })

      for (let i = 0; i < sampleData.organizations.length; i++) {
        const org = sampleData.organizations[i]
        
        try {
          const orgData = {
            name: org.name,
            address: org.address,
            phone: generatePhone(),
            email: `info@${org.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
            category: org.type
          }

          const response = await pipedrive.createOrganization(orgData)
          if (response.success && response.organization) {
            createdData.organizations.push(response.organization)
            setProgress(prev => ({
              ...prev,
              current: i + 1,
              message: `Created: ${org.name}`
            }))
            console.log(`✓ Created organization: ${org.name}`)
          } else {
            console.error(`Failed to create org: ${org.name}`, response)
          }
        } catch (error) {
          console.error(`Error creating org: ${org.name}`, error)
        }

        await delay(150) // Rate limiting
      }

      // Step 2: Create Persons
      setProgress({
        step: 'Persons',
        current: 0,
        total: sampleData.persons.length,
        message: 'Creating persons...',
        completed: false
      })

      for (let i = 0; i < sampleData.persons.length; i++) {
        const person = sampleData.persons[i]
        
        // Only create persons if we have organizations
        if (createdData.organizations.length === 0) {
          console.error('No organizations created, skipping person creation')
          break
        }
        
        const org = createdData.organizations[i % createdData.organizations.length]
        
        // Safety check for organization
        if (!org || !org.name) {
          console.error('Invalid organization data, skipping person:', person.first, person.last)
          continue
        }
        
        try {
          const orgDomain = org.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
          const personData = {
            name: `${person.first} ${person.last}`,
            email: `${person.first.toLowerCase()}.${person.last.toLowerCase()}@${orgDomain}.com`,
            phone: generatePhone(),
            job_title: person.title,
            org_id: org.id
          }

          const response = await pipedrive.createPerson(personData)
          if (response.success && response.person) {
            createdData.persons.push(response.person)
            setProgress(prev => ({
              ...prev,
              current: i + 1,
              message: `Created: ${person.first} ${person.last}`
            }))
          }
        } catch (error) {
          console.error(`Failed to create person: ${person.first} ${person.last}`, error)
        }

        await delay(150)
      }

      // Step 3: Create Deals
      const dealCount = 40
      setProgress({
        step: 'Deals',
        current: 0,
        total: dealCount,
        message: 'Creating deals...',
        completed: false
      })

      for (let i = 0; i < dealCount; i++) {
        // Only create deals if we have persons and organizations
        if (createdData.persons.length === 0 || createdData.organizations.length === 0) {
          console.error('No persons or organizations created, skipping deal creation')
          break
        }
        
        const service = sampleData.services[Math.floor(Math.random() * sampleData.services.length)]
        const person = createdData.persons[Math.floor(Math.random() * createdData.persons.length)]
        const org = createdData.organizations[Math.floor(Math.random() * createdData.organizations.length)]
        
        // Safety checks
        if (!person || !org || !service) {
          console.error('Invalid data for deal creation, skipping')
          continue
        }
        
        try {
          // Add variation to price (±40%)
          const variation = (Math.random() * 0.8) - 0.4
          const finalValue = Math.round(service.baseValue * (1 + variation))
          
          const dealData = {
            title: `${service.type} - ${person.name}`,
            value: finalValue,
            currency: 'USD',
            person_id: person.id,
            org_id: org.id,
            stage_id: Math.floor(Math.random() * 5) + 1,
            status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'won' : 'lost') : 'open'
          }

          const response = await pipedrive.createDeal(dealData)
          if (response.success && response.deal) {
            createdData.deals.push(response.deal)
            setProgress(prev => ({
              ...prev,
              current: i + 1,
              message: `Created: ${service.type} - $${finalValue.toLocaleString()}`
            }))
          }
        } catch (error) {
          console.error(`Failed to create deal: ${service.type}`, error)
        }

        await delay(200)
      }

      // Step 4: Create Activities
      const activityCount = 80
      setProgress({
        step: 'Activities',
        current: 0,
        total: activityCount,
        message: 'Creating activities...',
        completed: false
      })

      const activityTypes = ['call', 'meeting', 'task', 'email']
      const subjects = {
        call: ['Follow up call', 'Schedule appointment', 'Quote discussion', 'Customer check-in'],
        meeting: ['On-site consultation', 'Project meeting', 'Equipment walkthrough', 'Final inspection'],
        task: ['Prepare quote', 'Order equipment', 'Schedule technician', 'Update records'],
        email: ['Send quote', 'Appointment confirmation', 'Service summary', 'Invoice delivery']
      }

      for (let i = 0; i < activityCount; i++) {
        // Only create activities if we have persons and deals
        if (createdData.persons.length === 0 || createdData.deals.length === 0) {
          console.error('No persons or deals created, skipping activity creation')
          break
        }
        
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
        const subjectList = subjects[type as keyof typeof subjects]
        const subject = subjectList[Math.floor(Math.random() * subjectList.length)]
        const person = createdData.persons[Math.floor(Math.random() * createdData.persons.length)]
        const deal = createdData.deals[Math.floor(Math.random() * createdData.deals.length)]
        
        // Safety checks
        if (!person || !deal || !subject) {
          console.error('Invalid data for activity creation, skipping')
          continue
        }
        
        try {
          // Generate realistic timing
          const isCompleted = Math.random() > 0.4
          const daysOffset = isCompleted ? 
            -Math.floor(Math.random() * 30) : 
            Math.floor(Math.random() * 45) + 1
          
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + daysOffset)
          
          const activityData = {
            type: type,
            subject: subject,
            person_id: person.id,
            deal_id: deal.id,
            due_date: dueDate.toISOString().split('T')[0],
            due_time: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'][Math.floor(Math.random() * 6)],
            done: isCompleted
          }

          const response = await pipedrive.createActivity(activityData)
          if (response.success && response.activity) {
            createdData.activities.push(response.activity)
            setProgress(prev => ({
              ...prev,
              current: i + 1,
              message: `Created: ${subject} (${type})`
            }))
          }
        } catch (error) {
          console.error(`Failed to create activity: ${subject}`, error)
        }

        await delay(180)
      }

      // Completion
      setProgress({
        step: 'Complete',
        current: 100,
        total: 100,
        message: 'Data seeding completed successfully!',
        completed: true
      })

      setResults(createdData)

    } catch (error: any) {
      console.error('Seeding error:', error)
      setError(error.message || 'Failed to seed data')
    } finally {
      setIsSeeding(false)
    }
  }

  const progressPercentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Execute Pipedrive Data Seeding</h1>
          <p className="text-muted-foreground mt-2">
            Populate your Pipedrive account with comprehensive HVAC business sample data
          </p>
        </div>
      </div>

      {/* Execution Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Seeding Execution
          </CardTitle>
          <CardDescription>
            This will create realistic organizations, contacts, deals, and activities in your connected Pipedrive account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          {(isSeeding || progress.completed) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{progress.step}</span>
                <span className="text-sm text-muted-foreground">
                  {progress.total > 0 ? `${progress.current}/${progress.total}` : progressPercentage + '%'}
                </span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <p className="text-sm text-muted-foreground">{progress.message}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Seeding completed successfully!</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{results.organizations.length} Organizations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{results.persons.length} Persons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{results.deals.length} Deals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{results.activities.length} Activities</span>
                  </div>
                </div>
                <div className="mt-2 text-sm font-medium">
                  Total Pipeline Value: ${results.deals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0).toLocaleString()}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Execute Button */}
          <Button 
            onClick={executeSeedingNow} 
            disabled={isSeeding}
            size="lg"
            className="w-full"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Seeding Data... ({progress.step})
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Execute Data Seeding Now
              </>
            )}
          </Button>

          {/* Preview */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Will create:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 10 Organizations (Property management, offices, healthcare, etc.)</li>
              <li>• 15 Persons (Facility managers, property owners, decision makers)</li>
              <li>• 40 Deals (HVAC jobs valued $200-$12,000 each)</li>
              <li>• 80 Activities (Calls, meetings, tasks, emails)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Your CRM Now</CardTitle>
            <CardDescription>
              Navigate to different areas to see your data in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/jobs">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Jobs Pipeline
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard">
                  <Calendar className="mr-2 h-4 w-4" />
                  Activity Feed
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/contacts">
                  <Users className="mr-2 h-4 w-4" />
                  Contacts
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/reports">
                  <Database className="mr-2 h-4 w-4" />
                  Reports
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}