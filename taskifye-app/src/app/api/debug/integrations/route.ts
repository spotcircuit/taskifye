import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCachedApiKey, clearApiKeyCache } from '@/lib/cache/api-key-cache'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id') || 'client-1'
    
    // Get raw database records
    const apiSettings = await prisma.apiSettings.findUnique({
      where: { clientId }
    })
    
    // Test cache retrieval
    const [pipedriveKey, reachInboxKey] = await Promise.all([
      getCachedApiKey(clientId, 'pipedrive'),
      getCachedApiKey(clientId, 'reachinbox')
    ])
    
    // Get client info
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, slug: true }
    })
    
    return NextResponse.json({
      client,
      apiSettings: {
        hasRecord: !!apiSettings,
        hasPipedriveKey: !!apiSettings?.pipedriveApiKey,
        hasReachInboxKey: !!apiSettings?.reachInboxApiKey,
        pipedriveDomain: apiSettings?.pipedriveCompanyDomain
      },
      cache: {
        pipedriveKey: pipedriveKey ? '✓ Found in cache' : '✗ Not in cache',
        reachInboxKey: reachInboxKey ? '✓ Found in cache' : '✗ Not in cache'
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST to clear cache
export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get('x-client-id') || 'client-1'
    clearApiKeyCache(clientId)
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared for client: ' + clientId
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}