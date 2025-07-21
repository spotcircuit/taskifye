import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/quotes - List all quotes for a client
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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { clientId }
    if (status) {
      where.status = status
    }

    // Get quotes with pagination
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              jobNumber: true,
              customerName: true,
            }
          }
        }
      }),
      prisma.quote.count({ where })
    ])

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}

// POST /api/quotes - Create a new quote
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
    if (!body.title || !body.customerName || !body.lineItems || !Array.isArray(body.lineItems)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate quote number (you might want a more sophisticated approach)
    const count = await prisma.quote.count({ where: { clientId } })
    const quoteNumber = `Q-${Date.now()}-${count + 1}`

    // Calculate totals
    const subtotal = body.lineItems.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.rate)
    }, 0)
    
    const taxRate = body.taxRate || 0
    const taxAmount = subtotal * (taxRate / 100)
    const discount = body.discount || 0
    const total = subtotal + taxAmount - discount

    const quote = await prisma.quote.create({
      data: {
        clientId,
        quoteNumber,
        title: body.title,
        description: body.description,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        customerAddress: body.customerAddress,
        lineItems: body.lineItems,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        notes: body.notes,
        terms: body.terms,
        jobId: body.jobId,
        status: body.status || 'DRAFT'
      }
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}