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
        email: person.email ? [{ value: person.email, primary: true }] : undefined,
        phone: person.phone ? [{ value: person.phone, primary: true }] : undefined
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
}