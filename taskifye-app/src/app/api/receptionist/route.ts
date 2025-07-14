import { NextRequest, NextResponse } from 'next/server'
import { ReceptionistRequest, ReceptionistResponse, N8NWorkflowPayload } from '@/types/receptionist'

export async function POST(request: NextRequest) {
  try {
    const body: ReceptionistRequest = await request.json()

    // Validate request
    if (!body.sessionId || !body.input?.content) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and input.content' },
        { status: 400 }
      )
    }

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = process.env.N8N_RECEPTIONIST_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.error('N8N_RECEPTIONIST_WEBHOOK_URL not configured')
      
      // Return a fallback response for development
      const fallbackResponse: ReceptionistResponse = {
        sessionId: body.sessionId,
        message: "I'm currently being set up. Please check back soon or contact support directly.",
        status: 'error',
        actions: [
          {
            type: 'connect_agent',
            label: 'Connect to Human Agent',
            data: { priority: 'high' }
          }
        ]
      }
      
      return NextResponse.json(fallbackResponse)
    }

    // Forward request to n8n with business context
    const n8nPayload: N8NWorkflowPayload = {
      ...body,
      timestamp: new Date().toISOString(),
      source: 'taskifye-receptionist',
      businessInfo: {
        id: 'hvac-pro-001', // TODO: Get from session/auth
        name: 'HVAC Pro Services',
        timezone: 'America/Chicago',
        businessHours: {
          monday: { open: '8:00', close: '18:00' },
          tuesday: { open: '8:00', close: '18:00' },
          wednesday: { open: '8:00', close: '18:00' },
          thursday: { open: '8:00', close: '18:00' },
          friday: { open: '8:00', close: '18:00' },
          saturday: { open: '9:00', close: '14:00' },
          sunday: { open: 'closed', close: 'closed' },
        }
      }
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.N8N_API_KEY || '',
      },
      body: JSON.stringify(n8nPayload),
    })

    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook returned ${n8nResponse.status}`)
    }

    const responseData: ReceptionistResponse = await n8nResponse.json()

    // Log interaction for analytics
    console.log('Receptionist interaction:', {
      sessionId: body.sessionId,
      inputType: body.input.type,
      status: responseData.status,
      intent: responseData.metadata?.intent,
    })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Receptionist API error:', error)

    // Return error response
    const errorResponse: ReceptionistResponse = {
      sessionId: request.headers.get('x-session-id') || 'error',
      message: "I'm having trouble processing your request. Would you like to speak with a human agent?",
      status: 'error',
      actions: [
        {
          type: 'connect_agent',
          label: 'Yes, connect me',
          data: { reason: 'system_error' }
        }
      ]
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'taskifye-receptionist',
    timestamp: new Date().toISOString(),
  })
}