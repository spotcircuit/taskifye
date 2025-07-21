import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/quotes/[id]/convert - Convert quote to invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientId = request.headers.get('x-client-id')
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { id } = await params

    // Get the quote
    const quote = await prisma.quote.findFirst({
      where: {
        id,
        clientId
      }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Check if already converted
    const existingInvoice = await prisma.invoice.findFirst({
      where: { quoteId: id }
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Quote has already been converted to invoice' },
        { status: 400 }
      )
    }

    // Generate invoice number
    const count = await prisma.invoice.count({ where: { clientId } })
    const invoiceNumber = `INV-${Date.now()}-${count + 1}`

    // Create invoice from quote
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        invoiceNumber,
        quoteId: quote.id,
        jobId: quote.jobId,
        title: quote.title,
        description: quote.description,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        customerAddress: quote.customerAddress,
        lineItems: quote.lineItems as any,
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        discount: quote.discount,
        total: quote.total,
        notes: quote.notes,
        terms: quote.terms || body.terms,
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        status: 'DRAFT'
      }
    })

    // Update quote status
    await prisma.quote.update({
      where: { id },
      data: { 
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error converting quote to invoice:', error)
    return NextResponse.json(
      { error: 'Failed to convert quote to invoice' },
      { status: 500 }
    )
  }
}