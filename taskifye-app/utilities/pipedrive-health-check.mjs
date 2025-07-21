#!/usr/bin/env node

// Pipedrive Health Check Script
// This script tests the Pipedrive connection and analyzes the current data state

import fetch from 'node-fetch'

const PIPEDRIVE_API_BASE = 'https://api.pipedrive.com/v1'

class PipedriveHealthChecker {
  constructor(apiToken) {
    this.apiToken = apiToken
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${PIPEDRIVE_API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_token=${this.apiToken}`
    
    try {
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
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async runHealthCheck() {
    console.log('🏥 Pipedrive Health Check Starting...\n')

    // 1. Test Authentication
    console.log('1️⃣ Testing Authentication...')
    const authTest = await this.testConnection()
    
    if (!authTest.success) {
      console.log('❌ Authentication Failed:', authTest.error)
      console.log('\n💡 Next Steps:')
      console.log('   - Verify your API key is correct')
      console.log('   - Check if the API key has necessary permissions')
      console.log('   - Ensure your Pipedrive account is active')
      return
    }

    console.log('✅ Authentication Successful')
    console.log(`   User: ${authTest.user.name} (${authTest.user.email})`)
    console.log(`   Company: ${authTest.user.company_name}`)
    console.log('')

    // 2. Check Data Availability
    console.log('2️⃣ Checking Data Availability...')
    
    const dataChecks = [
      { name: 'Organizations', method: 'getOrganizations' },
      { name: 'Persons', method: 'getPersons' },
      { name: 'Deals', method: 'getDeals' },
      { name: 'Activities', method: 'getActivities' },
      { name: 'Pipelines', method: 'getPipelines' },
      { name: 'Stages', method: 'getStages' }
    ]

    const results = {}

    for (const check of dataChecks) {
      const result = await this[check.method]()
      results[check.name.toLowerCase()] = result
      
      if (result.success) {
        const count = this.getDataCount(result)
        console.log(`   ✅ ${check.name}: ${count} items`)
      } else {
        console.log(`   ❌ ${check.name}: ${result.error}`)
      }
    }

    console.log('')

    // 3. Data Quality Analysis
    console.log('3️⃣ Data Quality Analysis...')
    
    if (results.pipelines.success) {
      if (results.pipelines.pipelines.length === 0) {
        console.log('   🚨 CRITICAL: No pipelines found!')
        console.log('      This will prevent deal creation and management')
        console.log('      Create at least one pipeline in Pipedrive first')
      } else {
        console.log(`   ✅ Found ${results.pipelines.pipelines.length} pipeline(s):`)
        results.pipelines.pipelines.forEach(p => {
          console.log(`      - ${p.name} (ID: ${p.id})`)
        })
      }
    }

    if (results.stages.success && results.stages.stages.length > 0) {
      console.log(`   ✅ Found ${results.stages.stages.length} stage(s) across pipelines`)
    }

    // Check data relationships
    const orgCount = this.getDataCount(results.organizations)
    const personCount = this.getDataCount(results.persons)
    const dealCount = this.getDataCount(results.deals)

    if (orgCount === 0 && personCount === 0 && dealCount === 0) {
      console.log('   📭 Account is completely empty')
    } else if (orgCount < 5 || personCount < 10) {
      console.log('   📊 Limited sample data available')
    } else {
      console.log('   📈 Good amount of data available for testing')
    }

    console.log('')

    // 4. Sample Data Preview
    console.log('4️⃣ Sample Data Preview...')
    
    if (results.organizations.success && results.organizations.organizations.length > 0) {
      console.log('   🏢 Sample Organizations:')
      results.organizations.organizations.slice(0, 3).forEach((org, i) => {
        console.log(`      ${i + 1}. ${org.name} (ID: ${org.id})`)
      })
    }

    if (results.persons.success && results.persons.persons.length > 0) {
      console.log('   👥 Sample Persons:')
      results.persons.persons.slice(0, 3).forEach((person, i) => {
        const email = person.email && person.email.length > 0 ? person.email[0].value : 'No email'
        console.log(`      ${i + 1}. ${person.name} - ${email} (ID: ${person.id})`)
      })
    }

    if (results.deals.success && results.deals.deals.length > 0) {
      console.log('   💼 Sample Deals:')
      results.deals.deals.slice(0, 3).forEach((deal, i) => {
        console.log(`      ${i + 1}. ${deal.title} - $${deal.value || 0} (ID: ${deal.id})`)
      })
    }

    console.log('')

    // 5. Recommendations
    console.log('5️⃣ Recommendations...')
    
    if (!results.pipelines.success || results.pipelines.pipelines.length === 0) {
      console.log('   🚨 URGENT: Create pipelines in Pipedrive before seeding data')
      console.log('      1. Go to Pipedrive Settings → Sales Pipeline')
      console.log('      2. Create at least one pipeline with stages')
      console.log('      3. Note the pipeline and stage IDs for seeding')
    }

    if (orgCount === 0 && personCount === 0 && dealCount === 0) {
      console.log('   📝 RECOMMENDED: Run data seeding to populate test data')
      console.log('      - Navigate to /dashboard/execute-seeding in the app')
      console.log('      - Or run the seeding script manually')
    } else if (orgCount < 10 || personCount < 20) {
      console.log('   📈 OPTIONAL: Add more test data for better testing')
    } else {
      console.log('   ✅ Account has sufficient data for development and testing')
    }

    // 6. Integration Test
    console.log('')
    console.log('6️⃣ Integration Functionality Test...')
    
    // Test creating a simple person (and immediately delete it)
    try {
      const testPerson = await this.createTestPerson()
      if (testPerson.success) {
        console.log('   ✅ Create Person: Working')
        // Clean up
        await this.deletePerson(testPerson.person.id)
      } else {
        console.log('   ❌ Create Person: Failed -', testPerson.error)
      }
    } catch (error) {
      console.log('   ❌ Create Person: Error -', error.message)
    }

    console.log('')
    console.log('🏁 Health Check Complete!')
    console.log('')

    // Summary
    const issues = []
    if (!results.pipelines.success || results.pipelines.pipelines.length === 0) {
      issues.push('No pipelines found')
    }
    if (orgCount === 0 && personCount === 0 && dealCount === 0) {
      issues.push('No data in account')
    }

    if (issues.length === 0) {
      console.log('✅ All checks passed! Your Pipedrive integration is ready.')
    } else {
      console.log('⚠️  Issues found:')
      issues.forEach(issue => console.log(`   - ${issue}`))
    }
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
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Connection failed'
      }
    }
  }

  async getOrganizations() {
    try {
      const data = await this.makeRequest('/organizations?limit=100')
      return {
        success: true,
        organizations: data.data || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch organizations'
      }
    }
  }

  async getPersons() {
    try {
      const data = await this.makeRequest('/persons?limit=100')
      return {
        success: true,
        persons: data.data || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch persons'
      }
    }
  }

  async getDeals() {
    try {
      const data = await this.makeRequest('/deals?limit=100')
      return {
        success: true,
        deals: data.data || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch deals'
      }
    }
  }

  async getActivities() {
    try {
      const data = await this.makeRequest('/activities?limit=100')
      return {
        success: true,
        activities: data.data || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch activities'
      }
    }
  }

  async getPipelines() {
    try {
      const data = await this.makeRequest('/pipelines')
      return {
        success: true,
        pipelines: data.data || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch pipelines'
      }
    }
  }

  async getStages() {
    try {
      const data = await this.makeRequest('/stages')
      return {
        success: true,
        stages: data.data || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch stages'
      }
    }
  }

  async createTestPerson() {
    try {
      const data = await this.makeRequest('/persons', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Person (Auto-created)',
          email: ['test@healthcheck.com']
        })
      })
      return {
        success: true,
        person: data.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to create test person'
      }
    }
  }

  async deletePerson(personId) {
    try {
      await this.makeRequest(`/persons/${personId}`, {
        method: 'DELETE'
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  getDataCount(result) {
    if (!result.success) return 0
    
    if (result.organizations) return result.organizations.length
    if (result.persons) return result.persons.length
    if (result.deals) return result.deals.length
    if (result.activities) return result.activities.length
    if (result.pipelines) return result.pipelines.length
    if (result.stages) return result.stages.length
    
    return 0
  }
}

// Main execution
async function main() {
  const apiKey = process.env.PIPEDRIVE_API_KEY

  if (!apiKey) {
    console.log('❌ No API key provided!')
    console.log('')
    console.log('Usage options:')
    console.log('  1. Set environment variable: PIPEDRIVE_API_KEY=your_key node pipedrive-health-check.mjs')
    console.log('  2. Edit this script and replace YOUR_API_KEY_HERE with your actual key')
    console.log('')
    console.log('🔑 To get your API key:')
    console.log('   1. Log into Pipedrive')
    console.log('   2. Go to Settings → Personal Preferences → API')
    console.log('   3. Copy your Personal API Key')
    process.exit(1)
  }

  const checker = new PipedriveHealthChecker(apiKey)
  await checker.runHealthCheck()
}

main().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})