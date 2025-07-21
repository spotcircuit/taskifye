import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/quotes/[id] - Get a specific quote
export async function GET(
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

    const { id } = await params
    const quote = await prisma.quote.findFirst({
      where: {
        id,
        clientId
      },
      include: {
        job: {
          select: {
            id: true,
            jobNumber: true,
            customerName: true,
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}

// PUT /api/quotes/[id] - Update a quote
export async function PUT(
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

    // Check if quote exists and belongs to client
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        clientId
      }
    })

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Recalculate totals if line items changed
    let updateData: any = { ...body }
    
    if (body.lineItems) {
      const subtotal = body.lineItems.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.rate)
      }, 0)
      
      const taxRate = body.taxRate !== undefined ? body.taxRate : existingQuote.taxRate
      const taxAmount = subtotal * (Number(taxRate) / 100)
      const discount = body.discount !== undefined ? body.discount : existingQuote.discount
      const total = subtotal + taxAmount - Number(discount)

      updateData = {
        ...updateData,
        subtotal,
        taxAmount,
        total
      }
    }

    // Handle date fields
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil)
    }
    if (updateData.sentAt) {
      updateData.sentAt = new Date(updateData.sentAt)
    }
    if (updateData.acceptedAt) {
      updateData.acceptedAt = new Date(updateData.acceptedAt)
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    )
  }
}

// DELETE /api/quotes/[id] - Delete a quote
export async function DELETE(
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

    const { id } = await params
    // Check if quote exists and belongs to client
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        clientId
      }
    })

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Check if quote has been converted to invoice
    if (existingQuote.status === 'ACCEPTED') {
      const hasInvoice = await prisma.invoice.findFirst({
        where: { quoteId: id }
      })
      
      if (hasInvoice) {
        return NextResponse.json(
          { error: 'Cannot delete quote that has been converted to invoice' },
          { status: 400 }
        )
      }
    }

    await prisma.quote.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    )
  }
}