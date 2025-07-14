export interface BrandingConfig {
  companyName: string
  slogan?: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  favicon?: string
  emailSignature?: string
  supportEmail?: string
  supportPhone?: string
  website?: string
}

export interface BrandingSettings {
  branding: BrandingConfig
  businessType: string
}

export const defaultBranding: BrandingConfig = {
  companyName: 'Taskifye',
  slogan: 'Field Service Platform',
  primaryColor: '#3b82f6', // blue-500
  secondaryColor: '#10b981', // green-500
  supportEmail: 'support@taskifye.com',
  supportPhone: '1-800-TASKIFYE',
  website: 'https://taskifye.com'
}