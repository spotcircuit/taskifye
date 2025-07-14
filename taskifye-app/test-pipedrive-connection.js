const { SimplePipedriveClient } = require('./src/lib/pipedrive-simple.ts')

// Test script to check Pipedrive connection and data
async function testPipedriveConnection() {
  console.log('🔍 Testing Pipedrive Connection...')
  
  // You'll need to replace this with your actual API key
  // Check browser localStorage or environment for the key
  const API_KEY = process.env.PIPEDRIVE_API_KEY || 'YOUR_API_KEY_HERE'
  
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('❌ No API key found. Please set PIPEDRIVE_API_KEY environment variable or update this script.')
    console.log('   You can find your API key in Pipedrive at: Settings → Personal Preferences → API')
    return
  }
  
  const client = new SimplePipedriveClient(API_KEY)
  
  try {
    // Test connection
    console.log('\n1. Testing connection...')
    const connection = await client.testConnection()
    console.log('Connection result:', JSON.stringify(connection, null, 2))
    
    if (!connection.success) {
      console.log('❌ Connection failed, cannot proceed with data checks')
      return
    }
    
    console.log(`✅ Connected as: ${connection.user.name} (${connection.user.email})`)
    console.log(`   Company: ${connection.user.company_name}`)
    
    // Get existing data
    console.log('\n2. Checking existing data...')
    
    const [deals, organizations, persons, activities, pipelines, stages] = await Promise.all([
      client.getDeals({ limit: 100 }),
      client.getOrganizations({ limit: 100 }),
      client.getPersons({ limit: 100 }),
      client.getActivities({ limit: 100 }),
      client.getPipelines(),
      client.getStages()
    ])
    
    console.log('\n📊 Data Summary:')
    console.log(`   Organizations: ${organizations.success ? organizations.organizations.length : 'Error: ' + organizations.error}`)
    console.log(`   Persons: ${persons.success ? persons.persons.length : 'Error: ' + persons.error}`)
    console.log(`   Deals: ${deals.success ? deals.deals.length : 'Error: ' + deals.error}`)
    console.log(`   Activities: ${activities.success ? activities.activities.length : 'Error: ' + activities.error}`)
    console.log(`   Pipelines: ${pipelines.success ? pipelines.pipelines.length : 'Error: ' + pipelines.error}`)
    console.log(`   Stages: ${stages.success ? stages.stages.length : 'Error: ' + stages.error}`)
    
    // Show sample data
    if (organizations.success && organizations.organizations.length > 0) {
      console.log('\n🏢 Sample Organizations:')
      organizations.organizations.slice(0, 3).forEach((org, i) => {
        console.log(`   ${i + 1}. ${org.name} (ID: ${org.id})`)
      })
    }
    
    if (persons.success && persons.persons.length > 0) {
      console.log('\n👥 Sample Persons:')
      persons.persons.slice(0, 3).forEach((person, i) => {
        console.log(`   ${i + 1}. ${person.name} (ID: ${person.id}) - ${person.email?.[0]?.value || 'No email'}`)
      })
    }
    
    if (deals.success && deals.deals.length > 0) {
      console.log('\n💼 Sample Deals:')
      deals.deals.slice(0, 3).forEach((deal, i) => {
        console.log(`   ${i + 1}. ${deal.title} - $${deal.value || 0} (ID: ${deal.id})`)
      })
    }
    
    if (pipelines.success && pipelines.pipelines.length > 0) {
      console.log('\n🔄 Pipelines:')
      pipelines.pipelines.forEach((pipeline, i) => {
        console.log(`   ${i + 1}. ${pipeline.name} (ID: ${pipeline.id})`)
      })
    }
    
    if (stages.success && stages.stages.length > 0) {
      console.log('\n📈 Stages:')
      stages.stages.slice(0, 5).forEach((stage, i) => {
        console.log(`   ${i + 1}. ${stage.name} (Pipeline: ${stage.pipeline_id})`)
      })
    }
    
    // Check for potential issues
    console.log('\n🔍 Potential Issues:')
    
    if (!organizations.success) {
      console.log('   ❌ Cannot fetch organizations: ' + organizations.error)
    }
    
    if (!persons.success) {
      console.log('   ❌ Cannot fetch persons: ' + persons.error)
    }
    
    if (!deals.success) {
      console.log('   ❌ Cannot fetch deals: ' + deals.error)
    }
    
    if (organizations.success && organizations.organizations.length === 0) {
      console.log('   ⚠️  No organizations found - seeding will be needed')
    }
    
    if (persons.success && persons.persons.length === 0) {
      console.log('   ⚠️  No persons found - seeding will be needed')
    }
    
    if (deals.success && deals.deals.length === 0) {
      console.log('   ⚠️  No deals found - seeding will be needed')
    }
    
    if (pipelines.success && pipelines.pipelines.length === 0) {
      console.log('   ❌ No pipelines found - this is critical, need to create pipelines first')
    }
    
    console.log('\n✅ Pipedrive connection test completed!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testPipedriveConnection()