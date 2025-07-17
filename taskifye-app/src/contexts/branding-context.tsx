'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrandingConfig, defaultBranding } from '@/types/branding'
import { ClientService } from '@/lib/db/client-service'

interface BrandingContextType {
  branding: BrandingConfig
  updateBranding: (config: Partial<BrandingConfig>) => Promise<void>
  resetBranding: () => Promise<void>
  isLoading: boolean
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding)
  const [isLoading, setIsLoading] = useState(true)

  // Load branding from database on mount
  useEffect(() => {
    const loadBranding = async () => {
      try {
        // Initialize demo client first
        await ClientService.initializeDemoClient()
        
        // Load client data from database
        const client = await ClientService.getCurrentClient()
        
        const clientBranding: BrandingConfig = {
          companyName: client.branding?.companyName || client.companyName,
          slogan: client.branding?.tagline || undefined,
          logoUrl: client.branding?.logoUrl || undefined,
          primaryColor: client.branding?.primaryColor || defaultBranding.primaryColor,
          secondaryColor: client.branding?.secondaryColor || defaultBranding.secondaryColor,
          supportEmail: client.branding?.supportEmail || client.email || defaultBranding.supportEmail,
          supportPhone: client.branding?.supportPhone || client.phone || defaultBranding.supportPhone,
          website: client.website || defaultBranding.website,
        }
        
        setBranding(clientBranding)
        
        // Apply CSS variables
        if (clientBranding.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', clientBranding.primaryColor)
        }
        if (clientBranding.secondaryColor) {
          document.documentElement.style.setProperty('--secondary-color', clientBranding.secondaryColor)
        }
        
        // Update document title
        document.title = `${clientBranding.companyName} - Field Service Platform`
        
      } catch (error) {
        console.error('Failed to load branding from database:', error)
        // Fallback to localStorage
        const stored = localStorage.getItem('company_branding')
        if (stored) {
          const parsed = JSON.parse(stored)
          setBranding({ ...defaultBranding, ...parsed })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadBranding()
  }, [])

  // Update branding and persist to database
  const updateBranding = async (config: Partial<BrandingConfig>) => {
    const updated = { ...branding, ...config }
    setBranding(updated)
    
    try {
      // Save to database
      await ClientService.updateBranding(config)
      
      // Also save to localStorage as backup
      localStorage.setItem('company_branding', JSON.stringify(updated))
      
      // Update CSS variables for colors
      if (config.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', config.primaryColor)
      }
      if (config.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', config.secondaryColor)
      }
      
      // Update document title
      if (config.companyName) {
        document.title = `${config.companyName} - Field Service Platform`
      }
    } catch (error) {
      console.error('Failed to save branding:', error)
      // Revert state on error
      setBranding(branding)
      throw error
    }
  }

  // Reset to default branding
  const resetBranding = async () => {
    try {
      await ClientService.updateBranding(defaultBranding)
      setBranding(defaultBranding)
      localStorage.removeItem('company_branding')
      document.documentElement.style.removeProperty('--primary-color')
      document.documentElement.style.removeProperty('--secondary-color')
      document.title = 'Taskifye - Field Service Platform'
    } catch (error) {
      console.error('Failed to reset branding:', error)
      throw error
    }
  }

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding, isLoading }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}