import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to get current client ID (temporary until auth)
function getCurrentClientId(request: NextRequest): string {
  // Try to get from header first (sent by frontend)
  const clientId = request.headers.get('x-client-id')
  if (clientId) return clientId
  
  // Fallback to default
  return 'client-1'
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getCurrentClientId(request)
    
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { branding: true }
    })
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        businessType: client.businessType
      },
      branding: client.branding || {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        accentColor: '#f59e0b',
        companyName: client.name,
        tagline: '',
        supportEmail: client.email || '',
        supportPhone: client.phone || ''
      }
    })
  } catch (error) {
    console.error('Failed to fetch branding:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const clientId = getCurrentClientId(request)
    const data = await request.json()
    
    // Check if branding exists
    const existingBranding = await prisma.branding.findUnique({
      where: { clientId }
    })
    
    let branding
    if (existingBranding) {
      // Update existing
      branding = await prisma.branding.update({
        where: { clientId },
        data: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          logoUrl: data.logoUrl,
          faviconUrl: data.faviconUrl,
          companyName: data.companyName,
          tagline: data.tagline,
          supportEmail: data.supportEmail,
          supportPhone: data.supportPhone,
          customCss: data.customCss
        }
      })
    } else {
      // Create new
      branding = await prisma.branding.create({
        data: {
          clientId,
          primaryColor: data.primaryColor || '#3b82f6',
          secondaryColor: data.secondaryColor || '#10b981',
          accentColor: data.accentColor || '#f59e0b',
          logoUrl: data.logoUrl,
          faviconUrl: data.faviconUrl,
          companyName: data.companyName,
          tagline: data.tagline,
          supportEmail: data.supportEmail,
          supportPhone: data.supportPhone,
          customCss: data.customCss
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      branding
    })
  } catch (error) {
    console.error('Failed to update branding:', error)
    return NextResponse.json(
      { error: 'Failed to update branding' },
      { status: 500 }
    )
  }
}