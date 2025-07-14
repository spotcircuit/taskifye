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
    return this.client.getDeals(params)
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

  async getPipelines() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getPipelines',
        apiKey: this.apiKey
      })
    })
    return response.json()
  }

  async getOrganizations(options?: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getOrganizations',
        apiKey: this.apiKey,
        options
      })
    })
    return response.json()
  }

  async createOrganization(orgData: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createOrganization',
        apiKey: this.apiKey,
        orgData
      })
    })
    return response.json()
  }

  async getActivities(options?: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getActivities',
        apiKey: this.apiKey,
        options
      })
    })
    return response.json()
  }

  async createActivity(activityData: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createActivity',
        apiKey: this.apiKey,
        activityData
      })
    })
    return response.json()
  }

  async updateActivity(activityId: number, updates: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateActivity',
        apiKey: this.apiKey,
        activityId,
        updates
      })
    })
    return response.json()
  }

  async updateDeal(dealId: number, updates: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateDeal',
        apiKey: this.apiKey,
        dealId,
        updates
      })
    })
    return response.json()
  }

  async getStages(pipelineId?: number) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getStages',
        apiKey: this.apiKey,
        pipelineId
      })
    })
    return response.json()
  }

  async getDealFields() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getDealFields',
        apiKey: this.apiKey
      })
    })
    return response.json()
  }

  async getPersonFields() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getPersonFields',
        apiKey: this.apiKey
      })
    })
    return response.json()
  }

  async getOrganizationFields() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getOrganizationFields',
        apiKey: this.apiKey
      })
    })
    return response.json()
  }

  async addNote(entityType: 'deal' | 'person' | 'organization', entityId: number, content: string) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addNote',
        apiKey: this.apiKey,
        entityType,
        entityId,
        content
      })
    })
    return response.json()
  }

  async createPerson(personData: any) {
    return this.client.createPerson(personData)
  }

  async getPersons(params = {}) {
    return this.client.getPersons(params)
  }

  async searchPersons(term: string) {
    // Note: Search is not implemented in SimplePipedriveClient yet
    return this.client.getPersons({ limit: 100 })
  }

  async createDeal(dealData: any) {
    return this.client.createDeal(dealData)
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