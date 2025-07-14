export interface Agency {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  agencyId: string
  companyName: string
  businessType: string
  pipedriveApiKey?: string
  branding: {
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
    slogan?: string
  }
  settings: {
    timezone: string
    currency: string
    customFields?: Record<string, any>
  }
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise'
    status: 'active' | 'trial' | 'suspended' | 'cancelled'
    trialEndsAt?: Date
    billingCycle?: 'monthly' | 'yearly'
  }
  createdAt: Date
  updatedAt: Date
}

export interface UserRole {
  id: string
  userId: string
  role: 'super_admin' | 'agency_admin' | 'client_admin' | 'technician' | 'viewer'
  agencyId?: string
  clientId?: string
  permissions: string[]
}

export interface DeploymentTemplate {
  id: string
  agencyId: string
  name: string
  businessType: string
  description: string
  defaultBranding: {
    primaryColor: string
    secondaryColor: string
    slogan?: string
  }
  defaultSettings: {
    timezone: string
    currency: string
    customFields: Record<string, any>
    pipedriveStages: Array<{
      name: string
      order: number
    }>
    emailTemplates: Array<{
      type: string
      subject: string
      body: string
    }>
  }
  createdAt: Date
  updatedAt: Date
}