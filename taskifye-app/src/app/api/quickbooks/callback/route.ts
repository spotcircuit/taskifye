import { NextRequest, NextResponse } from 'next/server'
import { QuickBooksService, quickBooksStorage } from '@/lib/integrations/quickbooks'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const realmId = searchParams.get('realmId')
  const error = searchParams.get('error')

  // Handle errors
  if (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard/integrations?error=${error}`
    )
  }

  if (!code || !state || !realmId) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard/integrations?error=missing_parameters`
    )
  }

  try {
    // Verify state matches what we stored
    // In production, this should be stored in a database
    // const storedState = await getStoredState()
    // if (state !== storedState) {
    //   throw new Error('Invalid state parameter')
    // }

    // Get config from localStorage (in production, use database)
    const config = {
      clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
      redirectUri: `${request.nextUrl.origin}/api/quickbooks/callback`,
      environment: (process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
    }

    const qb = new QuickBooksService(config)
    
    // Exchange code for tokens
    const tokens = await qb.exchangeCodeForTokens(code, realmId)
    
    // In production, store these securely in database
    // For now, we'll return them to be stored client-side
    const redirectUrl = new URL('/dashboard/integrations', request.nextUrl.origin)
    redirectUrl.searchParams.set('quickbooks_connected', 'true')
    redirectUrl.searchParams.set('tokens', Buffer.from(JSON.stringify(tokens)).toString('base64'))
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('QuickBooks OAuth error:', error)
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard/integrations?error=oauth_failed`
    )
  }
}