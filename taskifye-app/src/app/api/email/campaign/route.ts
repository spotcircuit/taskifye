import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCachedApiKey } from '@/lib/cache/api-key-cache'

const prisma = new PrismaClient()

const REACHINBOX_API_URL = 'https://api.reachinbox.com/v1'

// Helper to send emails in batches
async function sendEmailBatch(
  recipients: Array<{ email: string; name?: string; data?: any }>,
  campaign: {
    subject: string
    content: string
    fromEmail: string
    fromName: string
    replyTo?: string
    templateId?: string
  },
  apiKey: string
) {
  const results = []
  
  // ReachInbox typically supports bulk sending
  // This is a simplified version - adjust based on actual API
  try {
    const response = await fetch(`${REACHINBOX_API_URL}/campaigns/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        campaign: {
          subject: campaign.subject,
          fromEmail: campaign.fromEmail,
          fromName: campaign.fromName,
          replyTo: campaign.replyTo,
          templateId: campaign.templateId,
          content: campaign.content
        },
        recipients: recipients.map(r => ({
          email: r.email,
          name: r.name || '',
          mergeData: r.data || {}
        })),
        settings: {
          trackOpens: true,
          trackClicks: true,
          sendTime: 'immediate'
        }
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Campaign send failed')
    }

    return {
      success: true,
      campaignId: result.campaignId,
      totalSent: result.totalSent || recipients.length,
      details: result
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      totalSent: 0
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id')
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.recipients || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      )
    }
    
    if (!body.subject || !body.content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Get ReachInbox API key
    const reachInboxApiKey = await getCachedApiKey(clientId, 'reachinbox')

    if (!reachInboxApiKey) {
      return NextResponse.json(
        { error: 'ReachInbox not configured. Please add your API key in settings.' },
        { status: 400 }
      )
    }

    // Get client branding info
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { branding: true }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Prepare campaign data
    const campaign = {
      subject: body.subject,
      content: body.content,
      fromEmail: body.fromEmail || client.email || 'noreply@taskifye.com',
      fromName: body.fromName || client.branding?.companyName || client.name,
      replyTo: body.replyTo || client.branding?.supportEmail || client.email,
      templateId: body.templateId
    }

    // Send email campaign
    const result = await sendEmailBatch(
      body.recipients,
      campaign,
      reachInboxApiKey
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaignId: result.campaignId,
      summary: {
        total: body.recipients.length,
        sent: result.totalSent,
        failed: body.recipients.length - result.totalSent
      },
      details: result.details
    })
  } catch (error) {
    console.error('Error sending email campaign:', error)
    return NextResponse.json(
      { error: 'Failed to send email campaign' },
      { status: 500 }
    )
  }
}

// GET /api/email/campaign - Get campaign templates
export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id')
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const reachInboxApiKey = await getCachedApiKey(clientId, 'reachinbox')

    if (!reachInboxApiKey) {
      return NextResponse.json(
        { error: 'ReachInbox not configured' },
        { status: 400 }
      )
    }

    // Fetch templates from ReachInbox
    const response = await fetch(`${REACHINBOX_API_URL}/templates`, {
      headers: {
        'Authorization': `Bearer ${reachInboxApiKey}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch templates')
    }

    const templates = await response.json()

    return NextResponse.json({
      templates: templates.data || [],
      total: templates.total || 0
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}