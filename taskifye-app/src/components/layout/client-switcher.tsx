'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'

interface Client {
  id: string
  name: string
  slug: string
  businessType: string | null
}

export function ClientSwitcher() {
  const [clients, setClients] = useState<Client[]>([])
  const [currentClientId, setCurrentClientId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])
  
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      
      if (data.clients && data.clients.length > 0) {
        setClients(data.clients)
        
        // Get current client from localStorage or use first client
        const savedClientId = localStorage.getItem('current_client_id') || data.clients[0].id
        setCurrentClientId(savedClientId)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      // Fallback to mock data if API fails
      const mockClients = [
        {
          id: 'client-1',
          name: 'Premium HVAC Services',
          slug: 'premium-hvac',
          businessType: 'hvac'
        }
      ]
      setClients(mockClients)
      setCurrentClientId(mockClients[0].id)
    } finally {
      setLoading(false)
    }
  }

  const handleClientChange = (clientId: string) => {
    setCurrentClientId(clientId)
    localStorage.setItem('current_client_id', clientId)
    
    // Reload the page to apply new client context
    // In production, this would update a context provider
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  const currentClient = clients.find(c => c.id === currentClientId)

  return (
    <Select value={currentClientId} onValueChange={handleClientChange}>
      <SelectTrigger className="w-[240px]">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <SelectValue>
            {currentClient?.name || 'Select Client'}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            <div className="flex flex-col">
              <span className="font-medium">{client.name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {client.businessType}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}