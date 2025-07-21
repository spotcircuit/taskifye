import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id') || 'client-1'
    
    // Call the settings API to see what it returns
    const settingsResponse = await fetch(`${request.nextUrl.origin}/api/settings/integrations`, {
      headers: {
        'x-client-id': clientId
      }
    })
    
    const settingsData = await settingsResponse.json()
    
    // Check integration status
    const integrations = [
      {
        name: 'Pipedrive',
        fields: ['pipedrive_api_key', 'pipedrive_domain']
      },
      {
        name: 'ReachInbox',
        fields: ['reachinbox_api_key']
      }
    ]
    
    const status = integrations.map(integration => {
      const hasAllFields = integration.fields.every(
        field => settingsData.credentials?.[field]
      )
      return {
        name: integration.name,
        fields: integration.fields.map(field => ({
          field,
          value: settingsData.credentials?.[field] || 'NOT SET'
        })),
        connected: hasAllFields
      }
    })
    
    return NextResponse.json({
      rawResponse: settingsData,
      integrationStatus: status,
      clientId
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}