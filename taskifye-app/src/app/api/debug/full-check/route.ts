import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCachedApiKey } from '@/lib/cache/api-key-cache'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Decrypt function to check raw values
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!'
const IV_LENGTH = 16

function decrypt(text: string): string {
  if (!text) return ''
  try {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
      iv
    )
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (error) {
    console.error('Decryption failed:', error)
    return 'DECRYPTION_FAILED'
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id') || 'client-1'
    
    // 1. Get client info
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })
    
    // 2. Get all clients to show what's available
    const allClients = await prisma.client.findMany({
      select: { id: true, name: true, slug: true }
    })
    
    // 3. Get API settings
    const apiSettings = await prisma.apiSettings.findUnique({
      where: { clientId }
    })
    
    // 4. Try to get from cache
    const [cachedPipedrive, cachedReachInbox] = await Promise.all([
      getCachedApiKey(clientId, 'pipedrive'),
      getCachedApiKey(clientId, 'reachinbox')
    ])
    
    // 5. Decrypt stored values (for debugging only!)
    let decryptedValues = null
    if (apiSettings) {
      decryptedValues = {
        pipedrive: apiSettings.pipedriveApiKey ? decrypt(apiSettings.pipedriveApiKey) : null,
        reachinbox: apiSettings.reachInboxApiKey ? decrypt(apiSettings.reachInboxApiKey) : null
      }
    }
    
    return NextResponse.json({
      requestedClientId: clientId,
      clientFound: !!client,
      clientInfo: client,
      allClients,
      apiSettings: {
        found: !!apiSettings,
        hasPipedriveKey: !!apiSettings?.pipedriveApiKey,
        hasReachInboxKey: !!apiSettings?.reachInboxApiKey,
        pipedriveDomain: apiSettings?.pipedriveCompanyDomain
      },
      cache: {
        pipedrive: cachedPipedrive ? 'Found' : 'Not found',
        reachinbox: cachedReachInbox ? 'Found' : 'Not found'
      },
      decryptedValues: {
        pipedrive: decryptedValues?.pipedrive ? 
          decryptedValues.pipedrive.substring(0, 10) + '...' : 
          'No key',
        reachinbox: decryptedValues?.reachinbox ?
          decryptedValues.reachinbox.substring(0, 10) + '...' :
          'No key'
      },
      localStorage: {
        hint: 'Check browser console: localStorage.getItem("current_client_id")'
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}