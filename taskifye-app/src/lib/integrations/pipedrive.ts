import { SimplePipedriveClient } from '@/lib/pipedrive-simple'

export class PipedriveService {
  private apiKey: string
  private client: SimplePipedriveClient

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.client = new SimplePipedriveClient(apiKey)
  }

  async testConnection() {
    return this.client.testConnection()
  }

  async getDeals(params = {}) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getDeals',
        apiKey: this.apiKey,
        ...params
      })
    })
    return response.json()
  }

  async getContacts(params = {}) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getContacts',
        apiKey: this.apiKey,
        ...params
      })
    })
    return response.json()
  }

  async getStats() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getStats',
        apiKey: this.apiKey
      })
    })
    return response.json()
  }
}

// Helper to store/retrieve API keys from localStorage (temporary solution)
export const pipedriveStorage = {
  setApiKey: (apiKey: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pipedrive_api_key', apiKey)
    }
  },
  getApiKey: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pipedrive_api_key')
    }
    return null
  },
  removeApiKey: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pipedrive_api_key')
    }
  }
}