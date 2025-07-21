import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // For now, hardcode Brian's user ID since we don't have auth
    // In production, this would come from the session
    const userId = 'brian@spotcircuit.com'
    
    // First get the user
    const user = await prisma.user.findUnique({
      where: { email: userId },
      include: {
        agency: true,
        clientAccess: {
          include: {
            client: {
              include: {
                branding: true
              }
            }
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get all clients the user has access to
    const clients = user.clientAccess.map(access => ({
      id: access.client.id,
      name: access.client.name,
      slug: access.client.slug,
      businessType: access.client.businessType,
      branding: access.client.branding ? {
        primaryColor: access.client.branding.primaryColor,
        secondaryColor: access.client.branding.secondaryColor,
        companyName: access.client.branding.companyName
      } : null,
      role: access.role
    }))
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      agency: user.agency,
      clients
    })
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}