import { NextRequest, NextResponse } from 'next/server'
import { ClientService } from '@/lib/db/client-service'

export async function GET() {
  try {
    const client = await ClientService.getCurrentClient()
    
    return NextResponse.json({
      success: true,
      branding: {
        companyName: client.branding?.companyName || client.companyName,
        slogan: client.branding?.tagline || '',
        logoUrl: client.branding?.logoUrl || '',
        primaryColor: client.branding?.primaryColor || '#3b82f6',
        secondaryColor: client.branding?.secondaryColor || '#10b981',
        supportEmail: client.branding?.supportEmail || client.email || '',
        supportPhone: client.branding?.supportPhone || client.phone || '',
        website: client.website || '',
      }
    })
  } catch (error: any) {
    console.error('Failed to get branding:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const branding = await request.json()
    
    await ClientService.updateBranding(branding)
    
    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully'
    })
  } catch (error: any) {
    console.error('Failed to update branding:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}