'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface IntegrationStatus {
  pipedrive: boolean
  twilio: boolean
  reachinbox: boolean
  quickbooks: boolean
}

interface IntegrationsContextType {
  status: IntegrationStatus
  isLoading: boolean
  refresh: () => Promise<void>
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined)

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<IntegrationStatus>({
    pipedrive: false,
    twilio: false,
    reachinbox: false,
    quickbooks: false
  })
  const [isLoading, setIsLoading] = useState(true)

  const checkIntegrations = async () => {
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/settings/integrations', {
        headers: {
          'x-client-id': clientId
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const credentials = data.credentials || {}
        
        setStatus({
          pipedrive: !!credentials.pipedrive_api_key,
          twilio: !!credentials.twilio_auth_token,
          reachinbox: !!credentials.reachinbox_api_key,
          quickbooks: !!credentials.quickbooks_client_secret
        })
      }
    } catch (error) {
      console.error('Failed to check integrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkIntegrations()
  }, [])

  const refresh = async () => {
    setIsLoading(true)
    await checkIntegrations()
  }

  return (
    <IntegrationsContext.Provider value={{ status, isLoading, refresh }}>
      {children}
    </IntegrationsContext.Provider>
  )
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext)
  if (!context) {
    throw new Error('useIntegrations must be used within IntegrationsProvider')
  }
  return context
}