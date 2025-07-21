import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/sms - Get SMS history
export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id')
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const direction = searchParams.get('direction') // 'inbound' or 'outbound'
    const jobId = searchParams.get('jobId')

    // Build where clause
    const where: any = { clientId }
    if (direction) {
      where.direction = direction
    }
    if (jobId) {
      where.jobId = jobId
    }

    // Get SMS messages with pagination
    const [messages, total] = await Promise.all([
      prisma.smsMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              jobNumber: true,
              customerName: true
            }
          }
        }
      }),
      prisma.smsMessage.count({ where })
    ])

    // Get statistics
    const stats = await prisma.smsMessage.groupBy({
      by: ['status'],
      where: { clientId },
      _count: true
    })

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total,
        byStatus: stats.reduce((acc, curr) => {
          acc[curr.status] = curr._count
          return acc
        }, {} as Record<string, number>)
      }
    })
  } catch (error) {
    console.error('Error fetching SMS history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SMS history' },
      { status: 500 }
    )
  }
}