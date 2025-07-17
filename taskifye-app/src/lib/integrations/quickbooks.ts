interface QuickBooksConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  environment: 'sandbox' | 'production'
}

interface QuickBooksTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  realmId: string
}

interface QuickBooksCustomer {
  Id?: string
  DisplayName: string
  PrimaryEmailAddr?: { Address: string }
  PrimaryPhone?: { FreeFormNumber: string }
  BillAddr?: {
    Line1?: string
    City?: string
    CountrySubDivisionCode?: string
    PostalCode?: string
  }
}

interface QuickBooksInvoice {
  Line: Array<{
    Amount: number
    DetailType: 'SalesItemLineDetail'
    SalesItemLineDetail: {
      ItemRef: { value: string; name?: string }
      Qty?: number
      UnitPrice?: number
    }
    Description?: string
  }>
  CustomerRef: { value: string }
  DueDate?: string
  TxnDate?: string
  DocNumber?: string
  CustomerMemo?: { value: string }
  BillEmail?: { Address: string }
}

export class QuickBooksService {
  private config: QuickBooksConfig
  private tokens: QuickBooksTokens | null = null
  private baseUrl: string

  constructor(config: QuickBooksConfig) {
    this.config = config
    this.baseUrl = config.environment === 'sandbox' 
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com'
  }

  // OAuth2 flow
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      state
    })
    
    const baseAuthUrl = this.config.environment === 'sandbox'
      ? 'https://appcenter.intuit.com/connect/oauth2'
      : 'https://appcenter.intuit.com/connect/oauth2'
    
    return `${baseAuthUrl}?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string, realmId: string): Promise<QuickBooksTokens> {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const data = await response.json()
    
    this.tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      realmId
    }
    
    return this.tokens
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available')
    }

    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refresh_token
      })
    })

    if (!response.ok) {
      throw new Error('Failed to refresh access token')
    }

    const data = await response.json()
    
    this.tokens = {
      ...this.tokens,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000)
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.tokens) {
      throw new Error('Not authenticated with QuickBooks')
    }

    // Refresh token if expired
    if (Date.now() >= this.tokens.expires_at) {
      await this.refreshAccessToken()
    }

    const url = `${this.baseUrl}/v3/company/${this.tokens.realmId}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokens.access_token}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`QuickBooks API error: ${error}`)
    }

    return response.json()
  }

  // Customer operations
  async createCustomer(customer: QuickBooksCustomer): Promise<QuickBooksCustomer> {
    const response = await this.makeRequest('/customer', {
      method: 'POST',
      body: JSON.stringify(customer)
    })
    return response.Customer
  }

  async getCustomer(customerId: string): Promise<QuickBooksCustomer> {
    const response = await this.makeRequest(`/customer/${customerId}`)
    return response.Customer
  }

  async findCustomerByName(displayName: string): Promise<QuickBooksCustomer | null> {
    const query = `select * from Customer where DisplayName = '${displayName}'`
    const response = await this.makeRequest(`/query?query=${encodeURIComponent(query)}`)
    
    if (response.QueryResponse?.Customer?.length > 0) {
      return response.QueryResponse.Customer[0]
    }
    return null
  }

  // Invoice operations
  async createInvoice(invoice: QuickBooksInvoice): Promise<any> {
    const response = await this.makeRequest('/invoice', {
      method: 'POST',
      body: JSON.stringify(invoice)
    })
    return response.Invoice
  }

  async getInvoice(invoiceId: string): Promise<any> {
    const response = await this.makeRequest(`/invoice/${invoiceId}`)
    return response.Invoice
  }

  // Create invoice from painting estimate
  async createInvoiceFromEstimate(estimate: any, customerId: string): Promise<any> {
    // First, ensure we have the customer in QuickBooks
    let qbCustomerId = customerId
    
    // If customer doesn't exist in QB, create them
    if (!customerId) {
      const customer = await this.createCustomer({
        DisplayName: estimate.customerName,
        BillAddr: {
          Line1: estimate.jobAddress
        }
      })
      qbCustomerId = customer.Id!
    }

    // Build invoice line items
    const lines = estimate.items.map((item: any) => ({
      Amount: item.total,
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        ItemRef: {
          value: '1', // This should map to actual QuickBooks item IDs
          name: item.description
        },
        Qty: item.quantity,
        UnitPrice: item.unitPrice
      },
      Description: `${item.description} - ${item.quantity} ${item.unit}`
    }))

    // Add profit as a line item if needed
    const totals = estimate.calculateTotals()
    if (totals.profitAmount > 0) {
      lines.push({
        Amount: totals.profitAmount,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: {
            value: '2', // Profit/markup item
            name: 'Profit Margin'
          }
        },
        Description: `Profit Margin (${estimate.profitMargin}%)`
      })
    }

    const invoice: QuickBooksInvoice = {
      Line: lines,
      CustomerRef: { value: qbCustomerId },
      DueDate: estimate.expiryDate,
      TxnDate: estimate.estimateDate,
      DocNumber: estimate.id,
      CustomerMemo: { value: estimate.notes }
    }

    return await this.createInvoice(invoice)
  }

  // Job costing
  async createJobCostingCategories(projectName: string): Promise<any> {
    // Create class for job tracking
    const jobClass = await this.makeRequest('/class', {
      method: 'POST',
      body: JSON.stringify({
        Name: projectName,
        Active: true
      })
    })

    return jobClass.Class
  }

  // Commission calculation
  calculateCommission(invoiceTotal: number, commissionRate: number): number {
    return invoiceTotal * (commissionRate / 100)
  }

  // Reports
  async getProfitAndLossReport(startDate: string, endDate: string): Promise<any> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      summarize_column_by: 'Month'
    })
    
    return await this.makeRequest(`/reports/ProfitAndLoss?${params.toString()}`)
  }

  async getCustomerBalances(): Promise<any> {
    return await this.makeRequest('/reports/CustomerBalance')
  }

  // Sync operations
  async syncCustomerFromPipedrive(pipedriveContact: any): Promise<QuickBooksCustomer> {
    // Check if customer already exists
    let customer = await this.findCustomerByName(pipedriveContact.name)
    
    if (!customer) {
      // Create new customer
      customer = await this.createCustomer({
        DisplayName: pipedriveContact.name,
        PrimaryEmailAddr: pipedriveContact.email?.[0] ? {
          Address: pipedriveContact.email[0]
        } : undefined,
        PrimaryPhone: pipedriveContact.phone?.[0] ? {
          FreeFormNumber: pipedriveContact.phone[0]
        } : undefined
      })
    }
    
    return customer
  }

  // Helper to store/retrieve tokens
  setTokens(tokens: QuickBooksTokens) {
    this.tokens = tokens
  }

  getTokens(): QuickBooksTokens | null {
    return this.tokens
  }
}

// Storage helper for QuickBooks tokens
export const quickBooksStorage = {
  saveTokens: (tokens: QuickBooksTokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quickbooks_tokens', JSON.stringify(tokens))
    }
  },
  
  getTokens: (): QuickBooksTokens | null => {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem('quickbooks_tokens')
      return tokens ? JSON.parse(tokens) : null
    }
    return null
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quickbooks_tokens')
    }
  }
}