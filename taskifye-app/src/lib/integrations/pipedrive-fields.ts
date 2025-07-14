// Pipedrive Custom Fields Manager
// This handles the mapping between our field names and Pipedrive's dynamic field keys

interface FieldMapping {
  [fieldName: string]: string // Maps our field name to Pipedrive's field key
}

class PipedriveFieldsManager {
  private static instance: PipedriveFieldsManager
  private dealFieldMappings: FieldMapping = {}
  private personFieldMappings: FieldMapping = {}
  private initialized = false

  private constructor() {}

  static getInstance(): PipedriveFieldsManager {
    if (!PipedriveFieldsManager.instance) {
      PipedriveFieldsManager.instance = new PipedriveFieldsManager()
    }
    return PipedriveFieldsManager.instance
  }

  async initialize(apiKey: string): Promise<void> {
    if (this.initialized) return

    try {
      // Check localStorage first
      const cached = this.loadFromCache()
      if (cached) {
        this.dealFieldMappings = cached.dealFields
        this.personFieldMappings = cached.personFields
        this.initialized = true
        return
      }

      // Fetch from API
      const response = await fetch(`/api/setup/pipedrive-fields?apiKey=${apiKey}`)
      const data = await response.json()

      if (data.fieldMappings) {
        this.dealFieldMappings = data.fieldMappings.dealFields || {}
        this.personFieldMappings = data.fieldMappings.personFields || {}
        this.saveToCache()
        this.initialized = true
      }
    } catch (error) {
      console.error('Failed to initialize Pipedrive fields:', error)
    }
  }

  // Get the Pipedrive field key for a deal field
  getDealFieldKey(fieldName: string): string | undefined {
    const normalizedName = fieldName.toLowerCase().replace(/\s+/g, '_')
    return this.dealFieldMappings[normalizedName]
  }

  // Get the Pipedrive field key for a person field
  getPersonFieldKey(fieldName: string): string | undefined {
    const normalizedName = fieldName.toLowerCase().replace(/\s+/g, '_')
    return this.personFieldMappings[normalizedName]
  }

  // Transform job data to include custom field keys
  transformJobData(jobData: any): any {
    const transformed = { ...jobData }

    // Map our field names to Pipedrive's custom field keys
    const fieldMappings = {
      serviceType: this.getDealFieldKey('service_type'),
      priority: this.getDealFieldKey('priority'),
      jobType: this.getDealFieldKey('job_type'),
      serviceAddress: this.getDealFieldKey('service_address'),
      scheduledTime: this.getDealFieldKey('scheduled_time'),
      technicianNotes: this.getDealFieldKey('technician_notes'),
      materialsUsed: this.getDealFieldKey('materials_used'),
      timeSpent: this.getDealFieldKey('time_spent_(hours)'),
      beforePhotosUrl: this.getDealFieldKey('before_photos_url'),
      afterPhotosUrl: this.getDealFieldKey('after_photos_url'),
      customerSignatureUrl: this.getDealFieldKey('customer_signature_url'),
      invoiceNumber: this.getDealFieldKey('invoice_number'),
      invoiceStatus: this.getDealFieldKey('invoice_status'),
    }

    // Move custom fields to their Pipedrive keys
    Object.entries(fieldMappings).forEach(([ourKey, pipedriveKey]) => {
      if (jobData[ourKey] && pipedriveKey) {
        transformed[pipedriveKey] = jobData[ourKey]
        delete transformed[ourKey]
      }
    })

    return transformed
  }

  // Extract custom fields from Pipedrive deal data
  extractCustomFields(dealData: any): any {
    const customFields: any = {}

    // Map Pipedrive's custom field keys back to our field names
    const reverseMapping: { [key: string]: string } = {
      [this.getDealFieldKey('service_type') || '']: 'serviceType',
      [this.getDealFieldKey('priority') || '']: 'priority',
      [this.getDealFieldKey('job_type') || '']: 'jobType',
      [this.getDealFieldKey('service_address') || '']: 'serviceAddress',
      [this.getDealFieldKey('scheduled_time') || '']: 'scheduledTime',
      [this.getDealFieldKey('technician_notes') || '']: 'technicianNotes',
      [this.getDealFieldKey('materials_used') || '']: 'materialsUsed',
      [this.getDealFieldKey('time_spent_(hours)') || '']: 'timeSpent',
      [this.getDealFieldKey('before_photos_url') || '']: 'beforePhotosUrl',
      [this.getDealFieldKey('after_photos_url') || '']: 'afterPhotosUrl',
      [this.getDealFieldKey('customer_signature_url') || '']: 'customerSignatureUrl',
      [this.getDealFieldKey('invoice_number') || '']: 'invoiceNumber',
      [this.getDealFieldKey('invoice_status') || '']: 'invoiceStatus',
    }

    Object.entries(dealData).forEach(([key, value]) => {
      if (reverseMapping[key]) {
        customFields[reverseMapping[key]] = value
      }
    })

    return customFields
  }

  private saveToCache(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pipedrive_field_mappings', JSON.stringify({
        dealFields: this.dealFieldMappings,
        personFields: this.personFieldMappings,
        timestamp: Date.now()
      }))
    }
  }

  private loadFromCache(): { dealFields: FieldMapping; personFields: FieldMapping } | null {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem('pipedrive_field_mappings')
      if (!cached) return null

      const data = JSON.parse(cached)
      
      // Cache for 24 hours
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('pipedrive_field_mappings')
        return null
      }

      return {
        dealFields: data.dealFields || {},
        personFields: data.personFields || {}
      }
    } catch {
      return null
    }
  }

  // Clear cache and re-initialize
  async refresh(apiKey: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pipedrive_field_mappings')
    }
    this.initialized = false
    await this.initialize(apiKey)
  }
}

export const pipedriveFields = PipedriveFieldsManager.getInstance()