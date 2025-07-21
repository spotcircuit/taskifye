import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/invoices/[id]/payment - Record payment for an invoice
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

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Valid payment amount is required' },
        { status: 400 }
      )
    }

    // Get the invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        clientId
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Calculate new amount paid
    const newAmountPaid = Number(invoice.amountPaid) + Number(body.amount)
    
    // Check if payment exceeds invoice total
    if (newAmountPaid > Number(invoice.total)) {
      return NextResponse.json(
        { error: 'Payment amount exceeds invoice total' },
        { status: 400 }
      )
    }

    // Determine new status
    const newStatus = newAmountPaid >= Number(invoice.total) ? 'PAID' : invoice.status
    const paidAt = newAmountPaid >= Number(invoice.total) ? new Date() : null

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        status: newStatus,
        paidAt: paidAt
      }
    })

    // Create payment record if there's a linked job
    if (invoice.jobId && body.method) {
      await prisma.payment.create({
        data: {
          jobId: invoice.jobId,
          clientId,
          amount: body.amount,
          method: body.method,
          referenceNumber: body.referenceNumber,
          receivedDate: body.receivedDate ? new Date(body.receivedDate) : new Date(),
          notes: body.notes || `Payment for invoice ${invoice.invoiceNumber}`
        }
      })

      // Update job payment status if fully paid
      if (newStatus === 'PAID') {
        await prisma.job.update({
          where: { id: invoice.jobId },
          data: { paymentStatus: 'PAID' }
        })
      }
    }

    return NextResponse.json({
      invoice: updatedInvoice,
      payment: {
        amount: body.amount,
        totalPaid: newAmountPaid,
        remaining: Number(invoice.total) - newAmountPaid,
        fullyPaid: newStatus === 'PAID'
      }
    })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}