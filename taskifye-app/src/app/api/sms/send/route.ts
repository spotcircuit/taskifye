import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCachedApiKey } from '@/lib/cache/api-key-cache'

const prisma = new PrismaClient()

// Helper to format phone numbers for Twilio
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Add country code if not present
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  
  // Assume it's already properly formatted
  return phone.startsWith('+') ? phone : `+${phone}`
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
    if (!body.to || !body.message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Get Twilio credentials from cache
    const [accountSid, authToken] = await Promise.all([
      prisma.apiSettings.findUnique({
        where: { clientId },
        select: { twilioAccountSid: true, twilioPhoneNumber: true }
      }),
      getCachedApiKey(clientId, 'twilio')
    ])

    if (!accountSid?.twilioAccountSid || !authToken || !accountSid?.twilioPhoneNumber) {
      return NextResponse.json(
        { error: 'Twilio not configured. Please add your Twilio credentials in settings.' },
        { status: 400 }
      )
    }

    // Format phone numbers
    const toNumber = formatPhoneNumber(body.to)
    const fromNumber = formatPhoneNumber(accountSid.twilioPhoneNumber)

    // Send SMS using Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid.twilioAccountSid}/Messages.json`
    
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid.twilioAccountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: toNumber,
        From: fromNumber,
        Body: body.message
      })
    })

    const twilioData = await twilioResponse.json()

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioData)
      return NextResponse.json(
        { 
          error: twilioData.message || 'Failed to send SMS',
          details: twilioData
        },
        { status: twilioResponse.status }
      )
    }

    // Save SMS record to database
    const smsRecord = await prisma.smsMessage.create({
      data: {
        clientId,
        to: toNumber,
        from: fromNumber,
        message: body.message,
        direction: 'outbound',
        status: twilioData.status || 'sent',
        twilioSid: twilioData.sid,
        jobId: body.jobId // Optional link to job
      }
    })

    return NextResponse.json({
      success: true,
      messageId: smsRecord.id,
      twilioSid: twilioData.sid,
      status: twilioData.status,
      to: twilioData.to,
      from: twilioData.from
    })
  } catch (error) {
    console.error('Error sending SMS:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}