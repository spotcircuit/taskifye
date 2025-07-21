export class PipedriveService {
  private clientId: string

  constructor() {
    // Get client ID from localStorage
    this.clientId = typeof window !== 'undefined' 
      ? localStorage.getItem('current_client_id') || 'client-1'
      : 'client-1'
  }

  async testConnection() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({ action: 'test' })
    })
    return response.json()
  }

  async getDeals(params = {}) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({ action: 'getDeals', ...params })
    })
    return response.json()
  }

  async getContacts(params = {}) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getPersons',
        ...params
      })
    })
    return response.json()
  }

  async getStats() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getStats',
      })
    })
    return response.json()
  }

  async getPipelines() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getPipelines',
      })
    })
    return response.json()
  }

  async getOrganizations(options?: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getOrganizations',
        options
      })
    })
    return response.json()
  }

  async createOrganization(orgData: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'createOrganization',
        orgData
      })
    })
    return response.json()
  }

  async getActivities(options?: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getActivities',
        options
      })
    })
    return response.json()
  }

  async createActivity(activityData: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'createActivity',
        activityData
      })
    })
    return response.json()
  }

  async updateActivity(activityId: number, updates: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'updateActivity',
        activityId,
        updates
      })
    })
    return response.json()
  }

  async updateDeal(dealId: number, updates: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'updateDeal',
        dealId,
        updates
      })
    })
    return response.json()
  }

  async getStages(pipelineId?: number) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getStages',
        pipelineId
      })
    })
    return response.json()
  }

  async getDealFields() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getDealFields',
      })
    })
    return response.json()
  }

  async getPersonFields() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getPersonFields',
      })
    })
    return response.json()
  }

  async getOrganizationFields() {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getOrganizationFields',
      })
    })
    return response.json()
  }

  async addNote(entityType: 'deal' | 'person' | 'organization', entityId: number, content: string) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'addNote',
        entityType,
        entityId,
        content
      })
    })
    return response.json()
  }

  async createPerson(personData: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'createPerson',
        ...personData
      })
    })
    return response.json()
  }

  async getPersons(params = {}) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'getPersons',
        ...params
      })
    })
    return response.json()
  }

  async searchPersons(term: string) {
    // Use getPersons with a limit for now
    return this.getPersons({ limit: 100 })
  }

  async createDeal(dealData: any) {
    const response = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-client-id': this.clientId
      },
      body: JSON.stringify({
        action: 'createDeal',
        ...dealData
      })
    })
    return response.json()
  }
}