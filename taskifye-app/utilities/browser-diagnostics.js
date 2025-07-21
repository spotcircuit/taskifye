// Browser Console Diagnostic Script for Pipedrive
// Copy and paste this into your browser console while on the app

async function runPipedriveDiagnostics() {
  console.log('🔍 Running Pipedrive Diagnostics...')
  
  // Check if API key exists in localStorage
  const apiKey = localStorage.getItem('pipedrive_api_key')
  
  if (!apiKey) {
    console.log('❌ No Pipedrive API key found in localStorage')
    console.log('   Please connect to Pipedrive first from the Integrations page')
    return
  }
  
  console.log('✅ API key found in localStorage:', apiKey.substring(0, 8) + '...')
  
  // Test connection through our API
  try {
    console.log('\n🔗 Testing connection...')
    const testResponse = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test',
        apiKey: apiKey
      })
    })
    
    const testResult = await testResponse.json()
    console.log('Connection test result:', testResult)
    
    if (!testResult.success) {
      console.log('❌ Connection test failed:', testResult.error)
      return
    }
    
    console.log(`✅ Connected as: ${testResult.user.name} (${testResult.user.email})`)
    
    // Get data counts
    console.log('\n📊 Fetching data...')
    
    const dataRequests = [
      { action: 'getOrganizations', name: 'Organizations' },
      { action: 'getPersons', name: 'Persons' },
      { action: 'getDeals', name: 'Deals' },
      { action: 'getActivities', name: 'Activities' },
      { action: 'getPipelines', name: 'Pipelines' },
      { action: 'getStages', name: 'Stages' }
    ]
    
    for (const request of dataRequests) {
      try {
        const response = await fetch('/api/integrations/pipedrive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: request.action,
            apiKey: apiKey,
            options: { limit: 100 }
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          const dataKey = request.action.replace('get', '').toLowerCase()
          const count = result[dataKey]?.length || 0
          console.log(`   ${request.name}: ${count} items`)
          
          // Show sample items
          if (count > 0 && result[dataKey]) {
            console.log(`     Sample ${request.name}:`)
            result[dataKey].slice(0, 2).forEach((item, i) => {
              if (item.name) {
                console.log(`       ${i + 1}. ${item.name} (ID: ${item.id})`)
              } else if (item.title) {
                console.log(`       ${i + 1}. ${item.title} - $${item.value || 0} (ID: ${item.id})`)
              } else {
                console.log(`       ${i + 1}. ${item.subject || 'Activity'} (ID: ${item.id})`)
              }
            })
          }
        } else {
          console.log(`   ❌ ${request.name}: Error - ${result.error}`)
        }
      } catch (error) {
        console.log(`   ❌ ${request.name}: Request failed - ${error.message}`)
      }
    }
    
    // Check for issues
    console.log('\n🔍 Analysis:')
    
    // Get fresh data for analysis
    const orgsResponse = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getOrganizations', apiKey: apiKey })
    })
    const orgsResult = await orgsResponse.json()
    
    const personsResponse = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getPersons', apiKey: apiKey })
    })
    const personsResult = await personsResponse.json()
    
    const dealsResponse = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getDeals', apiKey: apiKey })
    })
    const dealsResult = await dealsResponse.json()
    
    const pipelinesResponse = await fetch('/api/integrations/pipedrive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getPipelines', apiKey: apiKey })
    })
    const pipelinesResult = await pipelinesResponse.json()
    
    if (!orgsResult.success || (orgsResult.organizations && orgsResult.organizations.length === 0)) {
      console.log('   ⚠️  No organizations found - should run seeding')
    }
    
    if (!personsResult.success || (personsResult.persons && personsResult.persons.length === 0)) {
      console.log('   ⚠️  No persons found - should run seeding')
    }
    
    if (!dealsResult.success || (dealsResult.deals && dealsResult.deals.length === 0)) {
      console.log('   ⚠️  No deals found - should run seeding')
    }
    
    if (!pipelinesResult.success || (pipelinesResult.pipelines && pipelinesResult.pipelines.length === 0)) {
      console.log('   ❌ No pipelines found - CRITICAL: Create pipelines first!')
    } else if (pipelinesResult.pipelines) {
      console.log('   ✅ Found pipelines:', pipelinesResult.pipelines.map(p => p.name).join(', '))
    }
    
    console.log('\n📋 Recommendations:')
    
    if (orgsResult.success && personsResult.success && dealsResult.success) {
      if (orgsResult.organizations.length === 0 && personsResult.persons.length === 0 && dealsResult.deals.length === 0) {
        console.log('   📝 Account is empty - run full seeding to populate with test data')
        console.log('   🔗 Go to: /dashboard/execute-seeding')
      } else if (orgsResult.organizations.length < 10 || personsResult.persons.length < 20) {
        console.log('   📝 Limited data - consider running seeding to add more test data')
      } else {
        console.log('   ✅ Account has sufficient data for testing')
      }
    }
    
    console.log('\n✅ Diagnostics completed!')
    
  } catch (error) {
    console.error('❌ Error during diagnostics:', error)
  }
}

// Auto-run the diagnostics
runPipedriveDiagnostics()

// Also make it available as a global function
window.runPipedriveDiagnostics = runPipedriveDiagnostics

console.log('📋 Pipedrive diagnostic script loaded!')
console.log('   Run runPipedriveDiagnostics() anytime to check connection and data')