'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrandingConfig, defaultBranding } from '@/types/branding'

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
        // Get current client ID
        const clientId = localStorage.getItem('current_client_id') || 'client-1'
        
        // Fetch branding from API
        const response = await fetch('/api/settings/branding', {
          headers: {
            'x-client-id': clientId
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          const clientBranding: BrandingConfig = {
            companyName: data.companyName || defaultBranding.companyName,
            slogan: data.tagline || undefined,
            logoUrl: data.logoUrl || undefined,
            primaryColor: data.primaryColor || defaultBranding.primaryColor,
            secondaryColor: data.secondaryColor || defaultBranding.secondaryColor,
            supportEmail: data.supportEmail || defaultBranding.supportEmail,
            supportPhone: data.supportPhone || defaultBranding.supportPhone,
            website: data.website || defaultBranding.website,
            emailSignature: data.emailSignature || undefined
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
        }
        
      } catch (error) {
        console.error('Failed to load branding from API:', error)
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
      // Get current client ID
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      
      // Save to API
      const response = await fetch('/api/settings/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId
        },
        body: JSON.stringify({
          companyName: updated.companyName,
          tagline: updated.slogan,
          logoUrl: updated.logoUrl,
          primaryColor: updated.primaryColor,
          secondaryColor: updated.secondaryColor,
          supportEmail: updated.supportEmail,
          supportPhone: updated.supportPhone,
          website: updated.website,
          emailSignature: updated.emailSignature
        })
      })
      
      if (!response.ok) throw new Error('Failed to save branding')
      
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