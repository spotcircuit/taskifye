import { PrismaClient } from '@prisma/client'
import { BrandingConfig } from '@/types/branding'

const prisma = new PrismaClient()

// Helper function to get current tenant ID from session/auth
function getCurrentTenantId(): string {
  // In a real app, you'd get this from your auth session
  // For now, we'll use a mock tenant ID
  return 'demo-tenant-123'
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
  // Get current tenant data
  static async getCurrentClient() {
    const tenantId = getCurrentTenantId()
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })
    
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    const settings = tenant.settings as any || {}
    const apiKeys = tenant.apiKeys as any || {}

    // Decrypt API keys before returning
    return {
      id: tenant.id,
      companyName: tenant.name,
      slug: tenant.slug,
      settings,
      // Branding fields from settings
      logoUrl: settings.branding?.logoUrl,
      primaryColor: settings.branding?.primaryColor || '#3b82f6',
      secondaryColor: settings.branding?.secondaryColor || '#10b981',
      slogan: settings.branding?.slogan,
      supportEmail: settings.branding?.supportEmail,
      supportPhone: settings.branding?.supportPhone,
      website: settings.branding?.website,
      // Decrypt API keys
      pipedriveApiKey: apiKeys.pipedriveApiKey ? decryptApiKey(apiKeys.pipedriveApiKey) : null,
      reachinboxApiKey: apiKeys.reachinboxApiKey ? decryptApiKey(apiKeys.reachinboxApiKey) : null,
      calendlyApiKey: apiKeys.calendlyApiKey ? decryptApiKey(apiKeys.calendlyApiKey) : null,
    }
  }

  // Update tenant branding
  static async updateBranding(branding: Partial<BrandingConfig>) {
    const tenantId = getCurrentTenantId()
    
    // Get current settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })
    
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    const currentSettings = tenant.settings as any || {}
    const updatedSettings = {
      ...currentSettings,
      branding: {
        ...currentSettings.branding,
        ...branding
      }
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: updatedSettings,
        updatedAt: new Date(),
      }
    })
  }

  // Update API keys
  static async updateApiKeys(keys: {
    pipedriveApiKey?: string
    reachinboxApiKey?: string
    calendlyApiKey?: string
  }) {
    const tenantId = getCurrentTenantId()
    
    // Get current API keys
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })
    
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    const currentApiKeys = tenant.apiKeys as any || {}
    const updatedApiKeys = { ...currentApiKeys }

    // Encrypt API keys before storing
    if (keys.pipedriveApiKey) {
      updatedApiKeys.pipedriveApiKey = encryptApiKey(keys.pipedriveApiKey)
    }
    if (keys.reachinboxApiKey) {
      updatedApiKeys.reachinboxApiKey = encryptApiKey(keys.reachinboxApiKey)
    }
    if (keys.calendlyApiKey) {
      updatedApiKeys.calendlyApiKey = encryptApiKey(keys.calendlyApiKey)
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        apiKeys: updatedApiKeys,
        updatedAt: new Date(),
      }
    })
  }

  // Update business settings
  static async updateSettings(settings: {
    businessType?: string
    timezone?: string
    currency?: string
  }) {
    const tenantId = getCurrentTenantId()
    
    // Get current settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })
    
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    const currentSettings = tenant.settings as any || {}
    const updatedSettings = {
      ...currentSettings,
      ...settings
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: updatedSettings,
        updatedAt: new Date(),
      }
    })
  }

  // Initialize demo tenant (for development)
  static async initializeDemoClient() {
    const tenantId = getCurrentTenantId()
    
    // Check if tenant already exists
    const existing = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })
    
    if (existing) {
      return existing
    }

    // Create demo tenant
    const demoTenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        name: 'Demo HVAC Company',
        slug: 'demo-hvac',
        settings: {
          businessType: 'hvac',
          timezone: 'America/New_York',
          currency: 'USD',
          branding: {
            slogan: 'Your Comfort is Our Priority',
            supportEmail: 'support@demohvac.com',
            supportPhone: '1-800-DEMO-HVAC',
            website: 'https://demohvac.com',
            primaryColor: '#3b82f6',
            secondaryColor: '#10b981'
          }
        }
      }
    })

    return demoTenant
  }
}