import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/invoices - List all invoices for a client
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

    // Check for overdue invoices
    const now = new Date()
    if (status === 'OVERDUE') {
      where.status = { in: ['SENT', 'DRAFT'] }
      where.dueDate = { lt: now }
    }

    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
          },
          quote: {
            select: {
              id: true,
              quoteNumber: true,
            }
          }
        }
      }),
      prisma.invoice.count({ where })
    ])

    // Calculate statistics
    const stats = await prisma.invoice.aggregate({
      where: { clientId },
      _sum: {
        total: true,
        amountPaid: true
      },
      _count: true
    })

    const overdueInvoices = await prisma.invoice.count({
      where: {
        clientId,
        status: { in: ['SENT', 'DRAFT'] },
        dueDate: { lt: now }
      }
    })

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        totalAmount: Number(stats._sum.total || 0),
        totalPaid: Number(stats._sum.amountPaid || 0),
        totalOutstanding: Number(stats._sum.total || 0) - Number(stats._sum.amountPaid || 0),
        totalInvoices: stats._count,
        overdueCount: overdueInvoices
      }
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create a new invoice
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

    // Generate invoice number
    const count = await prisma.invoice.count({ where: { clientId } })
    const invoiceNumber = `INV-${Date.now()}-${count + 1}`

    // Calculate totals
    const subtotal = body.lineItems.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.rate)
    }, 0)
    
    const taxRate = body.taxRate || 0
    const taxAmount = subtotal * (taxRate / 100)
    const discount = body.discount || 0
    const total = subtotal + taxAmount - discount

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        invoiceNumber,
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
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: body.notes,
        terms: body.terms,
        jobId: body.jobId,
        quoteId: body.quoteId,
        status: body.status || 'DRAFT'
      }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}