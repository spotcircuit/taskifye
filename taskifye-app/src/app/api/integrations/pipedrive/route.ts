import { NextRequest, NextResponse } from 'next/server'
import { SimplePipedriveClient } from '@/lib/pipedrive-simple'

export async function POST(req: NextRequest) {
  try {
    const { action, apiKey, ...params } = await req.json()

    // Use provided API key or fall back to environment variable
    const pipedriveApiKey = apiKey || process.env.PIPEDRIVE_API_KEY

    if (!pipedriveApiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    const pipedrive = new SimplePipedriveClient(pipedriveApiKey)

    switch (action) {
      case 'test':
        return NextResponse.json(await pipedrive.testConnection())
      
      case 'getDeals':
        return NextResponse.json(await pipedrive.getDeals(params))
      
      case 'createDeal':
        return NextResponse.json(await pipedrive.createDeal(params))
      
      case 'getPersons':
        // For now, we'll use a simple fetch for persons list
        const personsResponse = await fetch(
          `https://api.pipedrive.com/v1/persons?api_token=${pipedriveApiKey}&limit=${params.limit || 10}`
        )
        const personsData = await personsResponse.json()
        return NextResponse.json({
          success: personsData.success || false,
          contacts: personsData.data || [],
          error: personsData.error
        })
      
      case 'createPerson':
        return NextResponse.json(await pipedrive.createPerson(params))
      
      case 'bulkCreatePersons':
        return NextResponse.json(await pipedrive.bulkCreatePersons(params.persons))
      
      case 'getStats':
        return NextResponse.json(await pipedrive.getStats())
      
      case 'getPipelines':
        return NextResponse.json(await pipedrive.getPipelines())
      
      case 'getOrganizations':
        return NextResponse.json(await pipedrive.getOrganizations(params.options))
      
      case 'createOrganization':
        return NextResponse.json(await pipedrive.createOrganization(params.orgData))
      
      case 'getActivities':
        return NextResponse.json(await pipedrive.getActivities(params.options))
      
      case 'createActivity':
        return NextResponse.json(await pipedrive.createActivity(params.activityData))
      
      case 'updateActivity':
        return NextResponse.json(await pipedrive.updateActivity(params.activityId, params.updates))
      
      case 'updateDeal':
        return NextResponse.json(await pipedrive.updateDeal(params.dealId, params.updates))
      
      case 'getStages':
        return NextResponse.json(await pipedrive.getStages(params.pipelineId))
      
      case 'getDealFields':
        return NextResponse.json(await pipedrive.getDealFields())
      
      case 'getPersonFields':
        return NextResponse.json(await pipedrive.getPersonFields())
      
      case 'getOrganizationFields':
        return NextResponse.json(await pipedrive.getOrganizationFields())
      
      case 'addNote':
        return NextResponse.json(await pipedrive.addNote(params.entityType, params.entityId, params.content))
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Pipedrive API error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}