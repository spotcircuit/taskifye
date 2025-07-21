import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// In-memory cache for API keys (server-side only)
const apiKeyCache = new Map<string, { key: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Decryption helper
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
    return ''
  }
}

export async function getCachedApiKey(clientId: string, service: 'pipedrive' | 'twilio' | 'reachinbox' | 'quickbooks'): Promise<string | null> {
  const cacheKey = `${clientId}:${service}`
  
  // Check cache first
  const cached = apiKeyCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.key
  }
  
  // Fetch from database
  try {
    const apiSettings = await prisma.apiSettings.findUnique({
      where: { clientId }
    })
    
    if (!apiSettings) return null
    
    let encryptedKey: string | null = null
    
    switch (service) {
      case 'pipedrive':
        encryptedKey = apiSettings.pipedriveApiKey
        break
      case 'twilio':
        encryptedKey = apiSettings.twilioAuthToken
        break
      case 'reachinbox':
        encryptedKey = apiSettings.reachInboxApiKey
        break
      case 'quickbooks':
        encryptedKey = apiSettings.quickbooksClientSecret
        break
    }
    
    if (!encryptedKey) return null
    
    const decryptedKey = decrypt(encryptedKey)
    
    // Cache the result
    apiKeyCache.set(cacheKey, {
      key: decryptedKey,
      timestamp: Date.now()
    })
    
    return decryptedKey
  } catch (error) {
    console.error(`Failed to get API key for ${service}:`, error)
    return null
  }
}

export function clearApiKeyCache(clientId?: string) {
  if (clientId) {
    // Clear specific client's keys
    const keysToDelete: string[] = []
    for (const key of apiKeyCache.keys()) {
      if (key.startsWith(`${clientId}:`)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => apiKeyCache.delete(key))
  } else {
    // Clear all
    apiKeyCache.clear()
  }
}