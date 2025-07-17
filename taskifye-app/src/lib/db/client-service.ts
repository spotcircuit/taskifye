import { PrismaClient } from '@prisma/client'
import { BrandingConfig } from '@/types/branding'

const prisma = new PrismaClient()

// Helper function to get current client ID from session/auth
function getCurrentClientId(): string {
  // In a real app, you'd get this from your auth session
  // For now, we'll use a mock client ID
  return 'demo-client-123'
}

// Helper function to encrypt API keys (basic example)
function encryptApiKey(key: string): string {
  // In production, use proper encryption with a secret key
  // For demo purposes, we'll just base64 encode
  return Buffer.from(key).toString('base64')
}

function decryptApiKey(encryptedKey: string): string {
  // In production, use proper decryption
  return Buffer.from(encryptedKey, 'base64').toString()
}

export class ClientService {
  // Get current client data with branding and API settings
  static async getCurrentClient() {
    const clientId = getCurrentClientId()
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        branding: true,
        apiSettings: true,
        agency: true
      }
    })
    
    if (!client) {
      throw new Error('Client not found')
    }

    const settings = client.settings as any || {}

    // Return client data with decrypted API keys
    return {
      id: client.id,
      companyName: client.name,
      slug: client.slug,
      businessType: client.businessType,
      email: client.email,
      phone: client.phone,
      website: client.website,
      settings,
      agency: client.agency,
      // Branding fields
      branding: client.branding ? {
        logoUrl: client.branding.logoUrl,
        faviconUrl: client.branding.faviconUrl,
        primaryColor: client.branding.primaryColor,
        secondaryColor: client.branding.secondaryColor,
        accentColor: client.branding.accentColor,
        companyName: client.branding.companyName,
        tagline: client.branding.tagline,
        supportEmail: client.branding.supportEmail,
        supportPhone: client.branding.supportPhone,
        customCss: client.branding.customCss,
      } : null,
      // Decrypted API keys
      apiSettings: client.apiSettings ? {
        pipedriveApiKey: client.apiSettings.pipedriveApiKey ? decryptApiKey(client.apiSettings.pipedriveApiKey) : null,
        pipedriveCompanyDomain: client.apiSettings.pipedriveCompanyDomain,
        twilioAccountSid: client.apiSettings.twilioAccountSid,
        twilioAuthToken: client.apiSettings.twilioAuthToken ? decryptApiKey(client.apiSettings.twilioAuthToken) : null,
        twilioPhoneNumber: client.apiSettings.twilioPhoneNumber,
        reachInboxApiKey: client.apiSettings.reachInboxApiKey ? decryptApiKey(client.apiSettings.reachInboxApiKey) : null,
        reachInboxWorkspaceId: client.apiSettings.reachInboxWorkspaceId,
        quickbooksClientId: client.apiSettings.quickbooksClientId,
        quickbooksRealmId: client.apiSettings.quickbooksRealmId,
        googleMapsApiKey: client.apiSettings.googleMapsApiKey ? decryptApiKey(client.apiSettings.googleMapsApiKey) : null,
        openAiApiKey: client.apiSettings.openAiApiKey ? decryptApiKey(client.apiSettings.openAiApiKey) : null,
      } : null
    }
  }

  // Update client branding
  static async updateBranding(branding: Partial<BrandingConfig>) {
    const clientId = getCurrentClientId()
    
    // Check if branding exists
    const existingBranding = await prisma.branding.findUnique({
      where: { clientId }
    })
    
    if (existingBranding) {
      await prisma.branding.update({
        where: { clientId },
        data: branding
      })
    } else {
      await prisma.branding.create({
        data: {
          clientId,
          ...branding
        }
      })
    }
  }

  // Update API settings
  static async updateApiSettings(keys: {
    pipedriveApiKey?: string
    pipedriveCompanyDomain?: string
    twilioAccountSid?: string
    twilioAuthToken?: string
    twilioPhoneNumber?: string
    reachInboxApiKey?: string
    reachInboxWorkspaceId?: string
    quickbooksClientId?: string
    quickbooksClientSecret?: string
    quickbooksRealmId?: string
    quickbooksRefreshToken?: string
    googleMapsApiKey?: string
    openAiApiKey?: string
  }) {
    const clientId = getCurrentClientId()
    
    // Check if API settings exist
    const existingSettings = await prisma.apiSettings.findUnique({
      where: { clientId }
    })
    
    // Prepare data with encrypted keys
    const data: any = {}
    
    if (keys.pipedriveApiKey) data.pipedriveApiKey = encryptApiKey(keys.pipedriveApiKey)
    if (keys.pipedriveCompanyDomain) data.pipedriveCompanyDomain = keys.pipedriveCompanyDomain
    if (keys.twilioAccountSid) data.twilioAccountSid = keys.twilioAccountSid
    if (keys.twilioAuthToken) data.twilioAuthToken = encryptApiKey(keys.twilioAuthToken)
    if (keys.twilioPhoneNumber) data.twilioPhoneNumber = keys.twilioPhoneNumber
    if (keys.reachInboxApiKey) data.reachInboxApiKey = encryptApiKey(keys.reachInboxApiKey)
    if (keys.reachInboxWorkspaceId) data.reachInboxWorkspaceId = keys.reachInboxWorkspaceId
    if (keys.quickbooksClientId) data.quickbooksClientId = keys.quickbooksClientId
    if (keys.quickbooksClientSecret) data.quickbooksClientSecret = encryptApiKey(keys.quickbooksClientSecret)
    if (keys.quickbooksRealmId) data.quickbooksRealmId = keys.quickbooksRealmId
    if (keys.quickbooksRefreshToken) data.quickbooksRefreshToken = encryptApiKey(keys.quickbooksRefreshToken)
    if (keys.googleMapsApiKey) data.googleMapsApiKey = encryptApiKey(keys.googleMapsApiKey)
    if (keys.openAiApiKey) data.openAiApiKey = encryptApiKey(keys.openAiApiKey)
    
    if (existingSettings) {
      await prisma.apiSettings.update({
        where: { clientId },
        data
      })
    } else {
      await prisma.apiSettings.create({
        data: {
          clientId,
          ...data
        }
      })
    }
  }

  // Update client settings
  static async updateSettings(settings: {
    businessType?: string
    timezone?: string
    currency?: string
  }) {
    const clientId = getCurrentClientId()
    
    // Get current settings
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })
    
    if (!client) {
      throw new Error('Client not found')
    }

    const currentSettings = client.settings as any || {}
    const updatedSettings = {
      ...currentSettings,
      ...settings
    }

    await prisma.client.update({
      where: { id: clientId },
      data: {
        settings: updatedSettings
      }
    })
  }

  // Initialize demo client (for development)
  static async initializeDemoClient() {
    const clientId = getCurrentClientId()
    const agencyId = 'demo-agency-123'
    
    // Check if agency exists
    let agency = await prisma.agency.findUnique({
      where: { id: agencyId }
    })
    
    if (!agency) {
      agency = await prisma.agency.create({
        data: {
          id: agencyId,
          name: 'Demo Agency',
          slug: 'demo-agency',
          email: 'demo@agency.com'
        }
      })
    }
    
    // Check if client already exists
    const existing = await prisma.client.findUnique({
      where: { id: clientId }
    })
    
    if (existing) {
      return existing
    }

    // Create demo client
    const demoClient = await prisma.client.create({
      data: {
        id: clientId,
        agencyId,
        name: 'Demo HVAC Company',
        slug: 'demo-hvac',
        businessType: 'hvac',
        email: 'info@demohvac.com',
        phone: '1-800-DEMO-HVAC',
        website: 'https://demohvac.com',
        settings: {
          timezone: 'America/New_York',
          currency: 'USD'
        }
      }
    })
    
    // Create default branding
    await prisma.branding.create({
      data: {
        clientId,
        companyName: 'Demo HVAC Company',
        tagline: 'Your Comfort is Our Priority',
        supportEmail: 'support@demohvac.com',
        supportPhone: '1-800-DEMO-HVAC',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        accentColor: '#f59e0b'
      }
    })

    return demoClient
  }
}