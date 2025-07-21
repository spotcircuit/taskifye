import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCachedApiKey } from '@/lib/cache/api-key-cache'

const prisma = new PrismaClient()

// Helper to format phone numbers
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  return phone.startsWith('+') ? phone : `+${phone}`
}

// Helper to send SMS in batches
async function sendSmsBatch(
  recipients: string[],
  message: string,
  fromNumber: string,
  accountSid: string,
  authToken: string,
  clientId: string
) {
  const results = []
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  
  for (const recipient of recipients) {
    try {
      const toNumber = formatPhoneNumber(recipient)
      
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Body: message
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Save successful SMS to database
        await prisma.smsMessage.create({
          data: {
            clientId,
            to: toNumber,
            from: fromNumber,
            message,
            direction: 'outbound',
            status: data.status || 'sent',
            twilioSid: data.sid
          }
        })
        
        results.push({
          recipient: toNumber,
          success: true,
          messageId: data.sid
        })
      } else {
        results.push({
          recipient: toNumber,
          success: false,
          error: data.message || 'Failed to send'
        })
      }
    } catch (error) {
      results.push({
        recipient,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return results
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
    
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get Twilio credentials
    const [apiSettings, authToken] = await Promise.all([
      prisma.apiSettings.findUnique({
        where: { clientId },
        select: { twilioAccountSid: true, twilioPhoneNumber: true }
      }),
      getCachedApiKey(clientId, 'twilio')
    ])

    if (!apiSettings?.twilioAccountSid || !authToken || !apiSettings?.twilioPhoneNumber) {
      return NextResponse.json(
        { error: 'Twilio not configured. Please add your Twilio credentials in settings.' },
        { status: 400 }
      )
    }

    const fromNumber = formatPhoneNumber(apiSettings.twilioPhoneNumber)

    // Send SMS campaign
    const results = await sendSmsBatch(
      body.recipients,
      body.message,
      fromNumber,
      apiSettings.twilioAccountSid,
      authToken,
      clientId
    )

    // Calculate summary
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed
      },
      results,
      campaignId: body.campaignId // If tracking campaigns
    })
  } catch (error) {
    console.error('Error sending SMS campaign:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS campaign' },
      { status: 500 }
    )
  }
}