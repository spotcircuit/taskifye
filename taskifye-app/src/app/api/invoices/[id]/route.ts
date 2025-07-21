import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/invoices/[id] - Get a specific invoice
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
    const invoice = await prisma.invoice.findFirst({
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
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            status: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - Update an invoice
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

    // Check if invoice exists and belongs to client
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        clientId
      }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Prevent editing paid invoices
    if (existingInvoice.status === 'PAID' && body.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Cannot edit paid invoices' },
        { status: 400 }
      )
    }

    // Recalculate totals if line items changed
    let updateData: any = { ...body }
    
    if (body.lineItems) {
      const subtotal = body.lineItems.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.rate)
      }, 0)
      
      const taxRate = body.taxRate !== undefined ? body.taxRate : existingInvoice.taxRate
      const taxAmount = subtotal * (Number(taxRate) / 100)
      const discount = body.discount !== undefined ? body.discount : existingInvoice.discount
      const total = subtotal + taxAmount - Number(discount)

      updateData = {
        ...updateData,
        subtotal,
        taxAmount,
        total
      }
    }

    // Handle date fields
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate)
    }
    if (updateData.sentAt) {
      updateData.sentAt = new Date(updateData.sentAt)
    }
    if (updateData.paidAt) {
      updateData.paidAt = new Date(updateData.paidAt)
    }

    // Check for overdue status
    if (updateData.dueDate && !updateData.status) {
      const now = new Date()
      if (new Date(updateData.dueDate) < now && existingInvoice.status !== 'PAID') {
        updateData.status = 'OVERDUE'
      }
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id] - Delete an invoice
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
    // Check if invoice exists and belongs to client
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        clientId
      }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Prevent deleting paid invoices
    if (existingInvoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoices' },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}