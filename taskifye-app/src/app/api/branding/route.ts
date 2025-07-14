import { NextRequest, NextResponse } from 'next/server'
import { ClientService } from '@/lib/db/client-service'

export async function GET() {
  try {
    const client = await ClientService.getCurrentClient()
    
    return NextResponse.json({
      success: true,
      branding: {
        companyName: client.companyName,
        slogan: client.slogan,
        logoUrl: client.logoUrl,
        primaryColor: client.primaryColor,
        secondaryColor: client.secondaryColor,
        supportEmail: client.supportEmail,
        supportPhone: client.supportPhone,
        website: client.website,
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