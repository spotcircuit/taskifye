import { NextRequest, NextResponse } from 'next/server'
import { QuickBooksService, quickBooksStorage } from '@/lib/integrations/quickbooks'
import { PipedriveService } from '@/lib/integrations/pipedrive'

export async function POST(request: NextRequest) {
  try {
    // Get tokens from request or storage
    const tokens = quickBooksStorage.getTokens()
    if (!tokens) {
      return NextResponse.json(
        { error: 'QuickBooks not connected' },
        { status: 401 }
      )
    }

    // Get Pipedrive API key
    const pipedriveApiKey = null // API key now comes from database
    if (!pipedriveApiKey) {
      return NextResponse.json(
        { error: 'Pipedrive not connected' },
        { status: 401 }
      )
    }

    // Initialize services
    const config = {
      clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
      redirectUri: `${request.nextUrl.origin}/api/quickbooks/callback`,
      environment: (process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
    }

    const qb = new QuickBooksService(config)
    qb.setTokens(tokens)

    const pipedrive = new PipedriveService()

    // Sync customers
    let customersSynced = 0
    let invoicesSynced = 0
    let errors = 0

    // Get all Pipedrive contacts
    const contactsResponse = await pipedrive.getContacts({ limit: 100 })
    if (contactsResponse.success && contactsResponse.contacts) {
      for (const contact of contactsResponse.contacts) {
        try {
          await qb.syncCustomerFromPipedrive(contact)
          customersSynced++
        } catch (error) {
          console.error(`Error syncing customer ${contact.name}:`, error)
          errors++
        }
      }
    }

    // Sync approved quotes as invoices
    const dealsResponse = await pipedrive.getDeals({ status: 'won' })
    if (dealsResponse.success && dealsResponse.deals) {
      for (const deal of dealsResponse.deals) {
        try {
          // TODO: Implement getNotes method in PipedriveService
          // For now, skip note-based invoice creation
          console.log('Skipping note-based invoice sync for deal:', deal.title)
        } catch (error) {
          console.error(`Error syncing deal ${deal.title}:`, error)
          errors++
        }
      }
    }

    return NextResponse.json({
      success: true,
      customers: customersSynced,
      invoices: invoicesSynced,
      errors
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}