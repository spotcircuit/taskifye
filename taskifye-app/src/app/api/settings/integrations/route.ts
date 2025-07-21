import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { clearApiKeyCache } from '@/lib/cache/api-key-cache'

const prisma = new PrismaClient()

// Simple encryption/decryption (in production, use proper key management)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!'
const IV_LENGTH = 16

function encrypt(text: string): string {
  if (!text) return ''
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  )
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

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
    return ''
  }
}

// Helper to get current client ID (temporary until auth)
function getCurrentClientId(request: NextRequest): string {
  const clientId = request.headers.get('x-client-id')
  if (clientId) return clientId
  return 'client-1'
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getCurrentClientId(request)
    
    const apiSettings = await prisma.apiSettings.findUnique({
      where: { clientId }
    })
    
    if (!apiSettings) {
      // Return empty credentials
      return NextResponse.json({ credentials: {} })
    }
    
    // Return credentials in the format expected by the UI
    const credentials: any = {}
    
    // Only show masked values for connected services
    if (apiSettings.pipedriveApiKey) {
      credentials.pipedrive_api_key = '••••••••••••••••••••••••••••••••'
      credentials.pipedrive_domain = apiSettings.pipedriveCompanyDomain || ''
    }
    if (apiSettings.twilioAccountSid) {
      credentials.twilio_account_sid = apiSettings.twilioAccountSid || ''
      credentials.twilio_auth_token = '••••••••••••••••••••••••••••••••'
      credentials.twilio_phone_number = apiSettings.twilioPhoneNumber || ''
    }
    if (apiSettings.reachInboxApiKey) {
      credentials.reachinbox_api_key = '••••••••••••••••••••••••••••••••'
      credentials.reachinbox_workspace_id = apiSettings.reachInboxWorkspaceId || ''
    }
    if (apiSettings.quickbooksClientId) {
      credentials.quickbooks_client_id = apiSettings.quickbooksClientId || ''
      credentials.quickbooks_client_secret = '••••••••••••••••••••••••••••••••'
      credentials.quickbooks_realm_id = apiSettings.quickbooksRealmId || ''
    }
    if (apiSettings.openAiApiKey) {
      credentials.openai_api_key = '••••••••••••••••••••••••••••••••'
    }
    
    return NextResponse.json({ credentials })
  } catch (error) {
    console.error('Failed to fetch API settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const clientId = getCurrentClientId(request)
    const data = await request.json()
    
    // Check if settings exist
    const existingSettings = await prisma.apiSettings.findUnique({
      where: { clientId }
    })
    
    // Handle credentials object format from the UI
    const credentials = data.credentials || data
    
    // Prepare update data (encrypt sensitive fields)
    const updateData: any = {}
    
    // Pipedrive
    if (credentials.pipedrive_api_key !== undefined) {
      // Only update if it's not a masked value
      if (!credentials.pipedrive_api_key.includes('•')) {
        updateData.pipedriveApiKey = credentials.pipedrive_api_key ? encrypt(credentials.pipedrive_api_key) : null
      }
    }
    if (credentials.pipedrive_domain !== undefined) {
      updateData.pipedriveCompanyDomain = credentials.pipedrive_domain
    }
    
    // Twilio
    if (credentials.twilio_account_sid !== undefined) {
      updateData.twilioAccountSid = credentials.twilio_account_sid
    }
    if (credentials.twilio_auth_token !== undefined && !credentials.twilio_auth_token.includes('•')) {
      updateData.twilioAuthToken = credentials.twilio_auth_token ? encrypt(credentials.twilio_auth_token) : null
    }
    if (credentials.twilio_phone_number !== undefined) {
      updateData.twilioPhoneNumber = credentials.twilio_phone_number
    }
    
    // ReachInbox
    if (credentials.reachinbox_api_key !== undefined && !credentials.reachinbox_api_key.includes('•')) {
      updateData.reachInboxApiKey = credentials.reachinbox_api_key ? encrypt(credentials.reachinbox_api_key) : null
    }
    if (credentials.reachinbox_workspace_id !== undefined) {
      updateData.reachInboxWorkspaceId = credentials.reachinbox_workspace_id
    }
    
    // QuickBooks
    if (credentials.quickbooks_client_id !== undefined) {
      updateData.quickbooksClientId = credentials.quickbooks_client_id
    }
    if (credentials.quickbooks_client_secret !== undefined) {
      updateData.quickbooksClientSecret = credentials.quickbooks_client_secret ? encrypt(credentials.quickbooks_client_secret) : null
    }
    if (credentials.quickbooks_realm_id !== undefined) {
      updateData.quickbooksRealmId = credentials.quickbooks_realm_id
    }
    
    // OpenAI
    if (credentials.openai_api_key !== undefined) {
      updateData.openAiApiKey = credentials.openai_api_key ? encrypt(credentials.openai_api_key) : null
    }
    
    let apiSettings
    if (existingSettings) {
      apiSettings = await prisma.apiSettings.update({
        where: { clientId },
        data: updateData
      })
    } else {
      apiSettings = await prisma.apiSettings.create({
        data: {
          clientId,
          ...updateData
        }
      })
    }
    
    // Clear the API key cache so new keys are loaded immediately
    clearApiKeyCache(clientId)
    
    return NextResponse.json({
      success: true,
      message: 'API settings updated successfully'
    })
  } catch (error) {
    console.error('Failed to update API settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}