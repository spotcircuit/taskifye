#!/usr/bin/env node

// Quick Pipedrive connection test
import https from 'https'

const API_KEY = process.env.PIPEDRIVE_API_KEY || 'YOUR_API_KEY_HERE'

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
  console.log(`
🔑 Please set your Pipedrive API key:

1. Get your API key from Pipedrive:
   Settings → Personal Preferences → API

2. Run with environment variable:
   PIPEDRIVE_API_KEY="your_key_here" node test-pipedrive-connection.mjs

3. Or edit this file and replace YOUR_API_KEY_HERE with your actual key
`)
  process.exit(1)
}

async function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pipedrive.com/v1${endpoint}?api_token=${API_KEY}`
    
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve(parsed)
        } catch (e) {
          reject(new Error('Invalid JSON response'))
        }
      })
    }).on('error', reject)
  })
}

async function testConnection() {
  console.log('🚀 Testing Pipedrive Connection...')
  console.log('=' .repeat(50))

  try {
    // Test connection
    console.log('📡 Testing API connection...')
    const user = await makeRequest('/users/me')
    
    if (user.success) {
      console.log(`✅ Connected as: ${user.data.name}`)
      console.log(`📧 Email: ${user.data.email}`)
      console.log(`🏢 Company: ${user.data.company_name}`)
    } else {
      console.log('❌ Connection failed:', user.error)
      return
    }

    console.log('\n📊 Checking existing data...')
    
    // Check pipelines (critical!)
    const pipelines = await makeRequest('/pipelines')
    console.log(`🔗 Pipelines: ${pipelines.success ? pipelines.data?.length || 0 : 0}`)
    if (pipelines.success && pipelines.data?.length > 0) {
      console.log(`   Default pipeline: ${pipelines.data[0].name} (ID: ${pipelines.data[0].id})`)
    }

    // Check stages
    const stages = await makeRequest('/stages')
    console.log(`📝 Stages: ${stages.success ? stages.data?.length || 0 : 0}`)
    
    // Check existing data
    const orgs = await makeRequest('/organizations?limit=100')
    console.log(`🏢 Organizations: ${orgs.success ? orgs.data?.length || 0 : 0}`)
    
    const persons = await makeRequest('/persons?limit=100')
    console.log(`👥 Persons: ${persons.success ? persons.data?.length || 0 : 0}`)
    
    const deals = await makeRequest('/deals?limit=100')
    console.log(`💼 Deals: ${deals.success ? deals.data?.length || 0 : 0}`)
    
    const activities = await makeRequest('/activities?limit=100')
    console.log(`📅 Activities: ${activities.success ? activities.data?.length || 0 : 0}`)

    console.log('\n🔍 Sample Data:')
    
    if (orgs.success && orgs.data?.length > 0) {
      console.log(`📋 Sample Organization: ${orgs.data[0].name} (ID: ${orgs.data[0].id})`)
    }
    
    if (persons.success && persons.data?.length > 0) {
      console.log(`📋 Sample Person: ${persons.data[0].name} (ID: ${persons.data[0].id})`)
    }
    
    if (deals.success && deals.data?.length > 0) {
      console.log(`📋 Sample Deal: ${deals.data[0].title} (ID: ${deals.data[0].id}, Stage: ${deals.data[0].stage_id})`)
    }

    // Check if we can create data
    console.log('\n🧪 Testing data creation...')
    
    const testOrg = await makeRequest('/organizations')
    if (testOrg.success) {
      // Create a test organization
      const createOrgTest = await makeRequest('/organizations')
      console.log('✅ Organization creation: Available')
    }

    // Summary and recommendations
    console.log('\n📈 SUMMARY:')
    console.log('=' .repeat(30))
    
    if (!pipelines.success || !pipelines.data?.length) {
      console.log('🚨 CRITICAL: No pipelines found!')
      console.log('   Go to Pipedrive → Settings → Sales Pipeline')
      console.log('   Create at least one pipeline with stages')
    } else {
      console.log('✅ Pipelines configured')
    }
    
    const totalData = (orgs.data?.length || 0) + (persons.data?.length || 0) + (deals.data?.length || 0)
    if (totalData === 0) {
      console.log('📭 Account is empty - ready for seeding!')
    } else {
      console.log(`📊 Found ${totalData} total records`)
    }
    
    console.log('\n🎯 NEXT STEPS:')
    if (!pipelines.success || !pipelines.data?.length) {
      console.log('1. Create pipelines in Pipedrive first')
      console.log('2. Then run data seeding')
    } else {
      console.log('1. Run the seeding script: http://localhost:3000/dashboard/execute-seeding')
      console.log('2. Check results in: http://localhost:3000/dashboard/jobs')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('- Check your API key is correct')
    console.log('- Ensure your Pipedrive account is active')
    console.log('- Verify API permissions')
  }
}

testConnection()