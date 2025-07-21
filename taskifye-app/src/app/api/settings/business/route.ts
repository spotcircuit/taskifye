import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to get current client ID (temporary until auth)
function getCurrentClientId(request: NextRequest): string {
  const clientId = request.headers.get('x-client-id')
  if (clientId) return clientId
  return 'client-1'
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getCurrentClientId(request)
    
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    const settings = client.settings as any || {}
    
    return NextResponse.json({
      name: client.name,
      businessType: client.businessType || '',
      email: client.email || '',
      phone: client.phone || '',
      website: client.website || '',
      address: settings.address || '',
      city: settings.city || '',
      state: settings.state || '',
      zip: settings.zip || '',
      country: settings.country || 'US',
      timezone: settings.timezone || 'America/New_York',
      currency: settings.currency || 'USD',
      taxRate: settings.taxRate || 0,
      businessHours: settings.businessHours || {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { closed: true },
        sunday: { closed: true }
      }
    })
  } catch (error) {
    console.error('Failed to fetch business settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const clientId = getCurrentClientId(request)
    const data = await request.json()
    
    // Get current settings
    const currentClient = await prisma.client.findUnique({
      where: { id: clientId }
    })
    
    if (!currentClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    const currentSettings = currentClient.settings as any || {}
    
    // Update client with new data
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        name: data.name,
        businessType: data.businessType,
        email: data.email,
        phone: data.phone,
        website: data.website,
        settings: {
          ...currentSettings,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
          timezone: data.timezone,
          currency: data.currency,
          taxRate: data.taxRate,
          businessHours: data.businessHours
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      client: updatedClient
    })
  } catch (error) {
    console.error('Failed to update business settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}