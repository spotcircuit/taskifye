import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCachedApiKey } from '@/lib/cache/api-key-cache'

const prisma = new PrismaClient()

// ReachInbox API endpoint (hypothetical - adjust based on actual API)
const REACHINBOX_API_URL = 'https://api.reachinbox.com/v1'

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
    if (!body.to || !body.subject || !body.content) {
      return NextResponse.json(
        { error: 'To, subject, and content are required' },
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

    // Get client info for sender details
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

    // Prepare email data
    const emailData = {
      to: body.to,
      from: body.from || client.email || 'noreply@taskifye.com',
      fromName: body.fromName || client.branding?.companyName || client.name,
      subject: body.subject,
      html: body.html || body.content,
      text: body.text || body.content,
      replyTo: body.replyTo || client.branding?.supportEmail || client.email,
      // Add tracking if specified
      trackOpens: body.trackOpens !== false,
      trackClicks: body.trackClicks !== false,
      // Custom headers
      headers: {
        'X-Client-ID': clientId,
        ...body.headers
      }
    }

    // Send email via ReachInbox
    const response = await fetch(`${REACHINBOX_API_URL}/emails/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${reachInboxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('ReachInbox error:', result)
      return NextResponse.json(
        { 
          error: result.message || 'Failed to send email',
          details: result
        },
        { status: response.status }
      )
    }

    // Note: In a real implementation, you might want to save email records to database
    // similar to how we save SMS messages

    return NextResponse.json({
      success: true,
      messageId: result.id || result.messageId,
      status: result.status || 'sent',
      details: {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject
      }
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}