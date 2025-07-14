import { PipedriveService } from '@/lib/integrations/pipedrive'

interface SeedDataConfig {
  organizations: number
  persons: number
  deals: number
  activities: number
}

export class PipedriveSeeder {
  private pipedrive: PipedriveService

  constructor(apiKey: string) {
    this.pipedrive = new PipedriveService(apiKey)
  }

  async seedAllData(config: SeedDataConfig = {
    organizations: 20,
    persons: 50,
    deals: 100,
    activities: 200
  }) {
    console.log('🌱 Starting Pipedrive data seeding...')
    
    try {
      // Step 1: Create Organizations (Companies)
      console.log('📢 Creating organizations...')
      const organizations = await this.createOrganizations(config.organizations)
      
      // Step 2: Create Persons (Contacts)
      console.log('👥 Creating persons...')
      const persons = await this.createPersons(config.persons, organizations)
      
      // Step 3: Create Deals (Jobs)
      console.log('💼 Creating deals...')
      const deals = await this.createDeals(config.deals, persons, organizations)
      
      // Step 4: Create Activities
      console.log('📅 Creating activities...')
      await this.createActivities(config.activities, deals, persons)
      
      console.log('✅ Data seeding completed successfully!')
      
      return {
        organizations: organizations.length,
        persons: persons.length,
        deals: deals.length,
        activities: config.activities
      }
    } catch (error) {
      console.error('❌ Error during data seeding:', error)
      throw error
    }
  }

  private async createOrganizations(count: number) {
    const organizations = []
    const companyTypes = [
      'Residential Property Management',
      'Commercial Office Building',
      'Retail Shopping Center',
      'Manufacturing Facility',
      'Healthcare Clinic',
      'School District',
      'Restaurant Chain',
      'Apartment Complex',
      'Hotel & Hospitality',
      'Warehouse & Distribution'
    ]

    const businessNames = [
      'Prime Properties LLC',
      'Metro Office Centers',
      'Sunset Mall Management',
      'Industrial Solutions Inc',
      'Valley Medical Group',
      'Lincoln School District',
      'Golden Gate Restaurants',
      'Riverside Apartments',
      'Grand Hotel Group',
      'Logistics Pro Warehousing',
      'Elite Commercial Real Estate',
      'Downtown Business Park',
      'Family Care Medical',
      'Tech Startup Hub',
      'Green Valley Shopping',
      'Luxury Resort Management',
      'City Center Properties',
      'Healthcare Partners',
      'Educational Services Group',
      'Hospitality Excellence'
    ]

    for (let i = 0; i < count; i++) {
      const orgData = {
        name: businessNames[i % businessNames.length] + (i > businessNames.length - 1 ? ` ${Math.floor(i / businessNames.length) + 1}` : ''),
        address: this.generateAddress(),
        phone: this.generatePhoneNumber(),
        email: `info@${businessNames[i % businessNames.length].toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
        website: `https://www.${businessNames[i % businessNames.length].toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
        category: companyTypes[i % companyTypes.length]
      }

      try {
        const response = await this.pipedrive.createOrganization(orgData)
        if (response.success && response.organization) {
          organizations.push(response.organization)
          console.log(`  ✓ Created organization: ${orgData.name}`)
        }
      } catch (error) {
        console.error(`  ✗ Failed to create organization: ${orgData.name}`, error)
      }

      // Rate limiting
      await this.delay(100)
    }

    return organizations
  }

  private async createPersons(count: number, organizations: any[]) {
    const persons = []
    const firstNames = [
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily',
      'James', 'Jessica', 'William', 'Ashley', 'Richard', 'Amanda', 'Thomas',
      'Jennifer', 'Charles', 'Michelle', 'Daniel', 'Stephanie', 'Matthew',
      'Laura', 'Anthony', 'Elizabeth', 'Mark', 'Susan', 'Donald', 'Karen',
      'Steven', 'Nancy', 'Kenneth', 'Betty', 'Joshua', 'Helen', 'Kevin'
    ]

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
      'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
    ]

    const jobTitles = [
      'Facility Manager', 'Property Manager', 'Maintenance Director',
      'Operations Manager', 'Building Owner', 'General Manager',
      'Site Supervisor', 'Office Manager', 'Facilities Coordinator',
      'Property Owner', 'Regional Manager', 'Administrative Assistant',
      'Operations Director', 'Building Superintendent', 'Project Manager'
    ]

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${this.generateEmailDomain()}`
      const org = organizations[Math.floor(Math.random() * organizations.length)]

      const personData = {
        name: `${firstName} ${lastName}`,
        email: email,
        phone: this.generatePhoneNumber(),
        job_title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
        org_id: org?.id
      }

      try {
        const response = await this.pipedrive.createPerson(personData)
        if (response.success && response.person) {
          persons.push(response.person)
          console.log(`  ✓ Created person: ${personData.name}`)
        }
      } catch (error) {
        console.error(`  ✗ Failed to create person: ${personData.name}`, error)
      }

      await this.delay(100)
    }

    return persons
  }

  private async createDeals(count: number, persons: any[], organizations: any[]) {
    const deals = []
    const serviceTypes = [
      'HVAC Installation', 'HVAC Repair', 'HVAC Maintenance',
      'Heating System Repair', 'Air Conditioning Service', 'Ductwork Installation',
      'Thermostat Installation', 'Indoor Air Quality', 'Heat Pump Service',
      'Boiler Repair', 'Furnace Replacement', 'AC Unit Replacement',
      'Emergency HVAC Service', 'Commercial HVAC', 'Preventive Maintenance'
    ]

    const priorities = ['low', 'medium', 'high', 'urgent']
    const stages = [1, 2, 3, 4, 5] // Corresponds to our job stages
    const statuses = ['open', 'won', 'lost']

    for (let i = 0; i < count; i++) {
      const person = persons[Math.floor(Math.random() * persons.length)]
      const org = organizations[Math.floor(Math.random() * organizations.length)]
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
      const priority = priorities[Math.floor(Math.random() * priorities.length)]
      const stage_id = stages[Math.floor(Math.random() * stages.length)]
      const status = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'won' : 'lost') : 'open'
      
      // Generate realistic values based on service type
      const baseValue = this.getServiceBaseValue(serviceType)
      const value = baseValue + (Math.random() * baseValue * 0.5) // +/- 50% variation

      const dealData = {
        title: `${serviceType} - ${person?.name || 'Unknown Customer'}`,
        value: Math.round(value),
        currency: 'USD',
        stage_id: stage_id,
        status: status,
        person_id: person?.id,
        org_id: org?.id,
        expected_close_date: this.generateFutureDate(),
        // Custom fields would be added here in real implementation
        custom_fields: {
          service_type: serviceType,
          priority: priority,
          equipment_type: this.getEquipmentType(serviceType),
          job_address: this.generateAddress(),
          estimated_duration: this.getEstimatedDuration(serviceType)
        }
      }

      try {
        const response = await this.pipedrive.createDeal(dealData)
        if (response.success && response.deal) {
          deals.push(response.deal)
          console.log(`  ✓ Created deal: ${dealData.title} ($${dealData.value})`)
        }
      } catch (error) {
        console.error(`  ✗ Failed to create deal: ${dealData.title}`, error)
      }

      await this.delay(100)
    }

    return deals
  }

  private async createActivities(count: number, deals: any[], persons: any[]) {
    const activityTypes = ['call', 'meeting', 'task', 'deadline', 'email', 'lunch']
    const subjects = {
      call: [
        'Follow up call with customer',
        'Schedule service appointment',
        'Quote discussion',
        'Customer satisfaction check',
        'Emergency service call'
      ],
      meeting: [
        'On-site consultation',
        'Project planning meeting',
        'Customer walkthrough',
        'Final inspection',
        'Contract signing'
      ],
      task: [
        'Prepare service quote',
        'Order equipment',
        'Schedule technician',
        'Update customer records',
        'Process payment'
      ],
      deadline: [
        'Project completion deadline',
        'Quote expiration',
        'Equipment delivery',
        'Permit application deadline',
        'Follow-up deadline'
      ],
      email: [
        'Send quote to customer',
        'Appointment confirmation',
        'Service completion summary',
        'Maintenance reminder',
        'Invoice delivery'
      ],
      lunch: [
        'Business lunch with client',
        'Team lunch meeting',
        'Vendor lunch meeting',
        'Customer appreciation lunch',
        'Partnership discussion lunch'
      ]
    }

    let createdCount = 0
    for (let i = 0; i < count; i++) {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
      const deal = deals[Math.floor(Math.random() * deals.length)]
      const person = persons[Math.floor(Math.random() * persons.length)]
      const typeSubjects = subjects[type as keyof typeof subjects]
      const subject = typeSubjects[Math.floor(Math.random() * typeSubjects.length)]

      // Generate realistic timing
      const isCompleted = Math.random() > 0.4 // 60% completed
      const dueDate = isCompleted ? this.generatePastDate() : this.generateFutureDate()

      const activityData = {
        type: type,
        subject: subject,
        deal_id: deal?.id,
        person_id: person?.id,
        due_date: dueDate.split('T')[0],
        due_time: this.generateBusinessTime(),
        duration: this.getActivityDuration(type),
        done: isCompleted,
        note: this.generateActivityNote(type, subject)
      }

      try {
        const response = await this.pipedrive.createActivity(activityData)
        if (response.success) {
          createdCount++
          console.log(`  ✓ Created activity: ${subject}`)
        }
      } catch (error) {
        console.error(`  ✗ Failed to create activity: ${subject}`, error)
      }

      await this.delay(150) // Slightly slower for activities
    }

    return createdCount
  }

  // Helper methods
  private generateAddress(): string {
    const streets = [
      'Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Second Ave',
      'Elm St', 'Maple Ave', 'Cedar Ln', 'Pine St', 'Washington Blvd'
    ]
    const cities = [
      'Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth',
      'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock'
    ]
    
    const number = Math.floor(Math.random() * 9999) + 1
    const street = streets[Math.floor(Math.random() * streets.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    
    return `${number} ${street}, ${city}, TX`
  }

  private generatePhoneNumber(): string {
    const areaCode = ['512', '713', '214', '210', '817', '915', '469', '361', '972', '806'][Math.floor(Math.random() * 10)]
    const exchange = Math.floor(Math.random() * 900) + 100
    const number = Math.floor(Math.random() * 9000) + 1000
    return `(${areaCode}) ${exchange}-${number}`
  }

  private generateEmailDomain(): string {
    const domains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'company.com',
      'business.net', 'enterprise.org', 'services.com'
    ]
    return domains[Math.floor(Math.random() * domains.length)]
  }

  private generateFutureDate(): string {
    const days = Math.floor(Math.random() * 60) + 1 // 1-60 days from now
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString()
  }

  private generatePastDate(): string {
    const days = Math.floor(Math.random() * 30) + 1 // 1-30 days ago
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString()
  }

  private generateBusinessTime(): string {
    const hours = [8, 9, 10, 11, 13, 14, 15, 16, 17] // Business hours, skip lunch
    const hour = hours[Math.floor(Math.random() * hours.length)]
    const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)]
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  private getServiceBaseValue(serviceType: string): number {
    const valueMap: Record<string, number> = {
      'HVAC Installation': 8000,
      'HVAC Repair': 450,
      'HVAC Maintenance': 200,
      'Heating System Repair': 350,
      'Air Conditioning Service': 300,
      'Ductwork Installation': 3500,
      'Thermostat Installation': 250,
      'Indoor Air Quality': 800,
      'Heat Pump Service': 400,
      'Boiler Repair': 600,
      'Furnace Replacement': 4500,
      'AC Unit Replacement': 5500,
      'Emergency HVAC Service': 750,
      'Commercial HVAC': 12000,
      'Preventive Maintenance': 180
    }
    return valueMap[serviceType] || 500
  }

  private getEquipmentType(serviceType: string): string {
    const equipmentMap: Record<string, string> = {
      'HVAC Installation': 'Central Air System',
      'HVAC Repair': 'Various',
      'HVAC Maintenance': 'Various',
      'Heating System Repair': 'Furnace',
      'Air Conditioning Service': 'AC Unit',
      'Ductwork Installation': 'Ductwork',
      'Thermostat Installation': 'Smart Thermostat',
      'Indoor Air Quality': 'Air Purifier',
      'Heat Pump Service': 'Heat Pump',
      'Boiler Repair': 'Boiler',
      'Furnace Replacement': 'High-Efficiency Furnace',
      'AC Unit Replacement': 'Central AC Unit',
      'Emergency HVAC Service': 'Various',
      'Commercial HVAC': 'Commercial Unit',
      'Preventive Maintenance': 'Various'
    }
    return equipmentMap[serviceType] || 'Standard Equipment'
  }

  private getEstimatedDuration(serviceType: string): string {
    const durationMap: Record<string, string> = {
      'HVAC Installation': '8-12 hours',
      'HVAC Repair': '2-4 hours',
      'HVAC Maintenance': '1-2 hours',
      'Heating System Repair': '2-3 hours',
      'Air Conditioning Service': '1-3 hours',
      'Ductwork Installation': '6-10 hours',
      'Thermostat Installation': '1 hour',
      'Indoor Air Quality': '2-4 hours',
      'Heat Pump Service': '2-3 hours',
      'Boiler Repair': '3-5 hours',
      'Furnace Replacement': '6-8 hours',
      'AC Unit Replacement': '4-8 hours',
      'Emergency HVAC Service': '1-4 hours',
      'Commercial HVAC': '1-3 days',
      'Preventive Maintenance': '1-2 hours'
    }
    return durationMap[serviceType] || '2-4 hours'
  }

  private getActivityDuration(type: string): string {
    const durationMap: Record<string, string> = {
      call: '00:15',
      meeting: '01:00',
      task: '00:30',
      deadline: '00:00',
      email: '00:05',
      lunch: '01:30'
    }
    return durationMap[type] || '00:30'
  }

  private generateActivityNote(type: string, subject: string): string {
    const noteTemplates: Record<string, string[]> = {
      call: [
        'Customer was very responsive and interested in our services.',
        'Left voicemail, customer will call back tomorrow.',
        'Discussed pricing and timeline, sending quote via email.',
        'Customer has questions about warranty coverage.',
        'Scheduled follow-up call for next week.'
      ],
      meeting: [
        'Productive meeting, customer approved the proposal.',
        'On-site assessment completed, preparing detailed quote.',
        'Reviewed project timeline and material requirements.',
        'Customer wants to think about it over the weekend.',
        'Excellent meeting, ready to move forward with project.'
      ],
      task: [
        'Task completed successfully and on time.',
        'Need to follow up with supplier on delivery date.',
        'Waiting on customer approval before proceeding.',
        'Task requires additional materials, ordered today.',
        'Completed ahead of schedule, customer very satisfied.'
      ],
      deadline: [
        'Critical deadline for project completion.',
        'Quote expires if not accepted by this date.',
        'Equipment delivery scheduled for this date.',
        'Permit application must be submitted by today.',
        'Final inspection deadline approaching.'
      ],
      email: [
        'Email sent with detailed quote and timeline.',
        'Confirmation email sent, awaiting customer response.',
        'Follow-up email sent with additional information.',
        'Invoice emailed with payment instructions.',
        'Maintenance reminder sent to customer.'
      ],
      lunch: [
        'Great discussion about future partnership opportunities.',
        'Customer relationship building over lunch.',
        'Discussed upcoming projects and potential collaboration.',
        'Successful business lunch, strengthened relationship.',
        'Lunch meeting to discuss contract terms and conditions.'
      ]
    }

    const templates = noteTemplates[type] || ['Standard activity completed.']
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Utility function for easy seeding
export async function seedPipedriveData(apiKey: string, config?: SeedDataConfig) {
  const seeder = new PipedriveSeeder(apiKey)
  return await seeder.seedAllData(config)
}