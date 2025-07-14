'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, Loader2, CheckCircle, AlertCircle,
  Building, Users, Briefcase, Calendar
} from 'lucide-react'
import { seedPipedriveData } from '@/lib/data/pipedrive-seeder'
import { pipedriveStorage } from '@/lib/integrations/pipedrive'

interface SeedProgress {
  step: string
  completed: number
  total: number
  message: string
}

export function DataSeeder() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [progress, setProgress] = useState<SeedProgress | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [config, setConfig] = useState({
    organizations: 25,
    persons: 60,
    deals: 150,
    activities: 300
  })

  const startSeeding = async () => {
    const apiKey = pipedriveStorage.getApiKey()
    if (!apiKey) {
      setError('Please connect to Pipedrive first from the Integrations page')
      return
    }

    setIsSeeding(true)
    setError(null)
    setResult(null)
    setProgress({ step: 'Starting...', completed: 0, total: 100, message: 'Initializing data seeding process' })

    try {
      // Simulate progress updates
      const progressUpdates = [
        { step: 'Organizations', completed: 10, message: 'Creating organizations and companies...' },
        { step: 'Persons', completed: 30, message: 'Creating contacts and customers...' },
        { step: 'Deals', completed: 60, message: 'Creating jobs and deals...' },
        { step: 'Activities', completed: 90, message: 'Creating activities and tasks...' },
        { step: 'Complete', completed: 100, message: 'Data seeding completed successfully!' }
      ]

      let currentStep = 0
      const progressInterval = setInterval(() => {
        if (currentStep < progressUpdates.length) {
          setProgress({
            ...progressUpdates[currentStep],
            total: 100
          })
          currentStep++
        }
      }, 2000)

      const seedResult = await seedPipedriveData(apiKey, config)
      
      clearInterval(progressInterval)
      setResult(seedResult)
      setProgress({ step: 'Complete', completed: 100, total: 100, message: 'All data created successfully!' })
      
    } catch (err: any) {
      console.error('Seeding error:', err)
      setError(err.message || 'Failed to seed data')
      setProgress(null)
    } finally {
      setIsSeeding(false)
    }
  }

  const clearData = async () => {
    // This would be implemented to clean up test data
    // For now, just show a warning
    alert('Data clearing not implemented yet. Please manually clean up test data in Pipedrive if needed.')
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Pipedrive Data Seeder
        </CardTitle>
        <CardDescription>
          Generate sample data for testing the CRM functionality. This will create realistic 
          organizations, contacts, deals, and activities in your connected Pipedrive account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="organizations">Organizations</Label>
            <Input
              id="organizations"
              type="number"
              value={config.organizations}
              onChange={(e) => setConfig({...config, organizations: parseInt(e.target.value) || 0})}
              disabled={isSeeding}
              min="1"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="persons">Persons (Contacts)</Label>
            <Input
              id="persons"
              type="number"
              value={config.persons}
              onChange={(e) => setConfig({...config, persons: parseInt(e.target.value) || 0})}
              disabled={isSeeding}
              min="1"
              max="200"
            />
          </div>
          <div>
            <Label htmlFor="deals">Deals (Jobs)</Label>
            <Input
              id="deals"
              type="number"
              value={config.deals}
              onChange={(e) => setConfig({...config, deals: parseInt(e.target.value) || 0})}
              disabled={isSeeding}
              min="1"
              max="500"
            />
          </div>
          <div>
            <Label htmlFor="activities">Activities</Label>
            <Input
              id="activities"
              type="number"
              value={config.activities}
              onChange={(e) => setConfig({...config, activities: parseInt(e.target.value) || 0})}
              disabled={isSeeding}
              min="1"
              max="1000"
            />
          </div>
        </div>

        {/* Progress */}
        {progress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{progress.step}</span>
              <span className="text-sm text-muted-foreground">{progress.completed}%</span>
            </div>
            <Progress value={progress.completed} className="w-full" />
            <p className="text-sm text-muted-foreground">{progress.message}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Data seeding completed successfully!</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{result.organizations} Organizations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{result.persons} Persons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{result.deals} Deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{result.activities} Activities</span>
                </div>
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

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={startSeeding} 
            disabled={isSeeding}
            className="flex-1"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Start Seeding
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearData}
            disabled={isSeeding}
          >
            Clear Test Data
          </Button>
        </div>

        {/* Warning */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Warning:</strong> This will create real data in your Pipedrive account. 
            Make sure you're using a test/development Pipedrive account, not production data.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}