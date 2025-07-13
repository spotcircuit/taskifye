// Simple Pipedrive API wrapper without SDK
const PIPEDRIVE_API_BASE = 'https://api.pipedrive.com/v1'

export class SimplePipedriveClient {
  private apiToken: string

  constructor(apiToken: string) {
    this.apiToken = apiToken
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${PIPEDRIVE_API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_token=${this.apiToken}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || `API call failed: ${response.statusText}`)
    }

    return data
  }

  async testConnection() {
    try {
      const data = await this.makeRequest('/users/me')
      return {
        success: true,
        user: {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          company_name: data.data.company_name
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection failed'
      }
    }
  }

  async getDeals(options: { status?: string, limit?: number, start?: number } = {}) {
    try {
      const params = new URLSearchParams({
        status: options.status || 'all_not_deleted',
        limit: String(options.limit || 10),
        start: String(options.start || 0)
      })
      
      const data = await this.makeRequest(`/deals?${params}`)
      
      return {
        success: true,
        deals: data.data || [],
        pagination: data.additional_data?.pagination
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch deals'
      }
    }
  }

  async createPerson(personData: {
    name: string,
    email?: string[],
    phone?: string[],
    org_id?: number,
    visible_to?: string
  }) {
    try {
      const data = await this.makeRequest('/persons', {
        method: 'POST',
        body: JSON.stringify(personData)
      })
      
      return {
        success: true,
        person: data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create person'
      }
    }
  }

  async createDeal(dealData: {
    title: string,
    value?: number,
    currency?: string,
    person_id?: number,
    org_id?: number,
    stage_id?: number,
    status?: string,
    visible_to?: string
  }) {
    try {
      const data = await this.makeRequest('/deals', {
        method: 'POST',
        body: JSON.stringify(dealData)
      })
      
      return {
        success: true,
        deal: data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create deal'
      }
    }
  }

  async getStats() {
    try {
      // Fetch deals summary
      const dealsParams = new URLSearchParams({
        status: 'open',
        limit: '100'
      })
      
      const [dealsData, personsData, activitiesData] = await Promise.all([
        this.makeRequest(`/deals?${dealsParams}`),
        this.makeRequest('/persons?limit=1'),
        this.makeRequest('/activities?done=0&limit=1')
      ])

      // Calculate total deal value
      const totalValue = dealsData.data?.reduce((sum: number, deal: any) => 
        sum + (deal.value || 0), 0
      ) || 0

      return {
        success: true,
        stats: {
          totalDeals: dealsData.data?.length || 0,
          dealsValue: totalValue,
          totalContacts: personsData.additional_data?.pagination?.total || 0,
          pendingActivities: activitiesData.additional_data?.pagination?.total || 0
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch stats'
      }
    }
  }

  async bulkCreatePersons(persons: Array<{
    name: string,
    email?: string,
    phone?: string,
    [key: string]: any
  }>) {
    const results = []
    
    for (const person of persons) {
      const personData = {
        name: person.name,
        email: person.email ? [person.email] : undefined,
        phone: person.phone ? [person.phone] : undefined
      }
      
      const result = await this.createPerson(personData)
      results.push(result)
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return {
      success: true,
      created: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }
  }

  async getPipelines() {
    try {
      const data = await this.makeRequest('/pipelines')
      
      return {
        success: true,
        pipelines: data.data || []
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch pipelines'
      }
    }
  }

  async getOrganizations(options: { limit?: number, start?: number } = {}) {
    try {
      const params = new URLSearchParams({
        limit: String(options.limit || 100),
        start: String(options.start || 0)
      })
      
      const data = await this.makeRequest(`/organizations?${params}`)
      
      return {
        success: true,
        organizations: data.data || [],
        pagination: data.additional_data?.pagination
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch organizations'
      }
    }
  }

  async createOrganization(orgData: {
    name: string,
    owner_id?: number,
    visible_to?: string,
    address?: string,
    [key: string]: any
  }) {
    try {
      const data = await this.makeRequest('/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData)
      })
      
      return {
        success: true,
        organization: data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create organization'
      }
    }
  }

  async getActivities(options: { 
    type?: string, 
    done?: 0 | 1,
    limit?: number,
    start?: number,
    user_id?: number,
    start_date?: string,
    end_date?: string
  } = {}) {
    try {
      const params = new URLSearchParams({
        limit: String(options.limit || 100),
        start: String(options.start || 0)
      })
      
      if (options.type) params.append('type', options.type)
      if (options.done !== undefined) params.append('done', String(options.done))
      if (options.user_id) params.append('user_id', String(options.user_id))
      if (options.start_date) params.append('start_date', options.start_date)
      if (options.end_date) params.append('end_date', options.end_date)
      
      const data = await this.makeRequest(`/activities?${params}`)
      
      return {
        success: true,
        activities: data.data || [],
        pagination: data.additional_data?.pagination
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch activities'
      }
    }
  }

  async createActivity(activityData: {
    subject: string,
    type: string, // call, meeting, task, deadline, email, lunch
    done?: 0 | 1,
    due_date?: string,
    due_time?: string,
    duration?: string, // HH:MM format
    person_id?: number,
    org_id?: number,
    deal_id?: number,
    note?: string,
    participants?: Array<{ person_id: number }>
  }) {
    try {
      const data = await this.makeRequest('/activities', {
        method: 'POST',
        body: JSON.stringify(activityData)
      })
      
      return {
        success: true,
        activity: data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create activity'
      }
    }
  }

  async updateActivity(activityId: number, updates: Partial<{
    subject: string,
    done: 0 | 1,
    type: string,
    due_date: string,
    due_time: string,
    note: string
  }>) {
    try {
      const data = await this.makeRequest(`/activities/${activityId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      return {
        success: true,
        activity: data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update activity'
      }
    }
  }

  async updateDeal(dealId: number, updates: Partial<{
    title: string,
    value: number,
    currency: string,
    stage_id: number,
    status: string,
    person_id: number,
    org_id: number,
    [key: string]: any // For custom fields
  }>) {
    try {
      const data = await this.makeRequest(`/deals/${dealId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      return {
        success: true,
        deal: data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update deal'
      }
    }
  }

  async getStages(pipelineId?: number) {
    try {
      const params = pipelineId ? `?pipeline_id=${pipelineId}` : ''
      const data = await this.makeRequest(`/stages${params}`)
      
      return {
        success: true,
        stages: data.data || []
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch stages'
      }
    }
  }

  async getDealFields() {
    try {
      const data = await this.makeRequest('/dealFields')
      
      return {
        success: true,
        fields: data.data || []
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch deal fields'
      }
    }
  }

  async getPersonFields() {
    try {
      const data = await this.makeRequest('/personFields')
      
      return {
        success: true,
        fields: data.data || []
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch person fields'
      }
    }
  }

  async getOrganizationFields() {
    try {
      const data = await this.makeRequest('/organizationFields')
      
      return {
        success: true,
        fields: data.data || []
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch organization fields'
      }
    }
  }

  async addNote(entityType: 'deal' | 'person' | 'organization', entityId: number, content: string) {
    try {
      const noteData: any = { content }
      
      if (entityType === 'deal') noteData.deal_id = entityId
      else if (entityType === 'person') noteData.person_id = entityId
      else if (entityType === 'organization') noteData.org_id = entityId
      
      const data = await this.makeRequest('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData)
      })
      
      return {
        success: true,
        note: data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to add note'
      }
    }
  }
}