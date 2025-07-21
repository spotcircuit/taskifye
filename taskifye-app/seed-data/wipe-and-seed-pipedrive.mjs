#!/usr/bin/env node

// Comprehensive Pipedrive data wipe and seed script
import https from 'https'

const API_KEY = process.env.PIPEDRIVE_API_KEY || '2911f330137024c4d04b3e0256f67d7a83102f1a'

if (!API_KEY) {
  console.log('❌ No API key provided')
  process.exit(1)
}

async function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pipedrive.com/v1${endpoint}${endpoint.includes('?') ? '&' : '?'}api_token=${API_KEY}`
    const urlObj = new URL(url)
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      res.on('data', (chunk) => responseData += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve(parsed)
        } catch (e) {
          reject(new Error('Invalid JSON response: ' + responseData.substring(0, 200)))
        }
      })
    })

    req.on('error', reject)
    
    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function findAllData() {
  console.log('🔍 SCANNING ALL DATA in Pipedrive...')
  console.log('=' .repeat(50))

  try {
    // Check different pagination limits and start points
    const endpoints = [
      { name: 'Organizations', endpoint: '/organizations', params: '?limit=500&start=0' },
      { name: 'Persons', endpoint: '/persons', params: '?limit=500&start=0' },
      { name: 'Deals', endpoint: '/deals', params: '?limit=500&start=0&status=all_not_deleted' },
      { name: 'Activities', endpoint: '/activities', params: '?limit=500&start=0' },
      { name: 'Notes', endpoint: '/notes', params: '?limit=500&start=0' },
      { name: 'Files', endpoint: '/files', params: '?limit=500&start=0' }
    ]

    const allData = {}

    for (const { name, endpoint, params } of endpoints) {
      console.log(`📋 Checking ${name}...`)
      try {
        const response = await makeRequest(endpoint + params)
        
        if (response.success && response.data) {
          allData[name.toLowerCase()] = response.data
          console.log(`   ✅ Found ${response.data.length} ${name}`)
          
          // Show sample data
          if (response.data.length > 0) {
            const sample = response.data[0]
            console.log(`   📝 Sample: ${sample.name || sample.title || sample.subject || sample.content?.substring(0, 30) || 'No name'} (ID: ${sample.id})`)
          }
        } else {
          allData[name.toLowerCase()] = []
          console.log(`   📭 No ${name} found`)
        }
      } catch (error) {
        console.log(`   ❌ Error fetching ${name}: ${error.message}`)
        allData[name.toLowerCase()] = []
      }
      
      await delay(100)
    }

    return allData
  } catch (error) {
    console.error('❌ Error scanning data:', error.message)
    return {}
  }
}

async function wipeAllData(allData) {
  console.log('\n🧹 WIPING ALL DATA...')
  console.log('=' .repeat(30))

  // Order matters - delete in reverse dependency order
  const deleteOrder = [
    { name: 'Activities', data: allData.activities },
    { name: 'Deals', data: allData.deals },
    { name: 'Notes', data: allData.notes },
    { name: 'Files', data: allData.files },
    { name: 'Persons', data: allData.persons },
    { name: 'Organizations', data: allData.organizations }
  ]

  for (const { name, data } of deleteOrder) {
    if (!data || data.length === 0) {
      console.log(`⏭️  Skipping ${name} (none found)`)
      continue
    }

    console.log(`🗑️  Deleting ${data.length} ${name}...`)
    
    for (const item of data) {
      try {
        const endpoint = `/${name.toLowerCase()}/${item.id}`
        const response = await makeRequest(endpoint, 'DELETE')
        
        if (response.success) {
          console.log(`   ✅ Deleted ${item.name || item.title || item.subject || item.id}`)
        } else {
          console.log(`   ❌ Failed to delete ${item.id}: ${response.error}`)
        }
      } catch (error) {
        console.log(`   ❌ Error deleting ${item.id}: ${error.message}`)
      }
      
      await delay(100) // Rate limiting
    }
  }
}

async function getStages() {
  console.log('🎯 Getting pipeline stages...')
  const stages = await makeRequest('/stages')
  
  if (stages.success && stages.data) {
    console.log(`✅ Found ${stages.data.length} stages:`)
    stages.data.forEach(stage => {
      console.log(`   Stage: ${stage.name} (ID: ${stage.id})`)
    })
    return stages.data
  } else {
    console.log('❌ No stages found - you need to create a pipeline first!')
    return []
  }
}

async function seedFreshData(stages) {
  console.log('\n🌱 SEEDING FRESH DATA...')
  console.log('=' .repeat(30))

  const createdData = {
    organizations: [],
    persons: [],
    deals: [],
    activities: []
  }

  // Sample data for HVAC business
  const organizations = [
    { name: 'Prime Properties LLC', address: '1234 Oak Ave, Austin, TX 78701' },
    { name: 'Metro Office Centers', address: '5678 Main St, Houston, TX 77001' },
    { name: 'Sunset Mall Management', address: '9012 Park Blvd, Dallas, TX 75201' },
    { name: 'Valley Medical Group', address: '3456 Cedar Ln, San Antonio, TX 78201' },
    { name: 'Lincoln School District', address: '7890 Elm St, Fort Worth, TX 76101' }
  ]

  const persons = [
    { first: 'John', last: 'Smith', title: 'Facility Manager' },
    { first: 'Sarah', last: 'Johnson', title: 'Property Manager' },
    { first: 'Michael', last: 'Williams', title: 'Maintenance Director' },
    { first: 'Lisa', last: 'Brown', title: 'Operations Manager' },
    { first: 'David', last: 'Jones', title: 'Building Owner' }
  ]

  const services = [
    { type: 'HVAC Installation', value: 8000 },
    { type: 'HVAC Repair', value: 450 },
    { type: 'HVAC Maintenance', value: 200 },
    { type: 'Air Conditioning Service', value: 300 },
    { type: 'Heating System Repair', value: 350 }
  ]

  function generatePhone() {
    const areaCodes = ['512', '713', '214', '210', '817']
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)]
    const exchange = Math.floor(Math.random() * 900) + 100
    const number = Math.floor(Math.random() * 9000) + 1000
    return `(${areaCode}) ${exchange}-${number}`
  }

  // Create Organizations
  console.log('🏢 Creating Organizations...')
  for (const org of organizations) {
    try {
      const orgData = {
        name: org.name,
        address: org.address
      }

      const response = await makeRequest('/organizations', 'POST', orgData)
      
      if (response.success && response.data) {
        createdData.organizations.push(response.data)
        console.log(`   ✅ Created: ${org.name}`)
      } else {
        console.log(`   ❌ Failed: ${org.name} - ${response.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${org.name} - ${error.message}`)
    }
    
    await delay(150)
  }

  // Create Persons
  console.log('\n👥 Creating Persons...')
  for (let i = 0; i < persons.length; i++) {
    const person = persons[i]
    const org = createdData.organizations[i] || createdData.organizations[0]
    
    if (!org) {
      console.log('   ⚠️  No organizations created, skipping persons')
      break
    }

    try {
      const personData = {
        name: `${person.first} ${person.last}`,
        email: [`${person.first.toLowerCase()}.${person.last.toLowerCase()}@${org.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`],
        phone: [generatePhone()],
        job_title: person.title,
        org_id: org.id
      }

      const response = await makeRequest('/persons', 'POST', personData)
      
      if (response.success && response.data) {
        createdData.persons.push(response.data)
        console.log(`   ✅ Created: ${person.first} ${person.last}`)
      } else {
        console.log(`   ❌ Failed: ${person.first} ${person.last} - ${response.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${person.first} ${person.last} - ${error.message}`)
    }
    
    await delay(150)
  }

  // Create Deals
  console.log('\n💼 Creating Deals...')
  for (let i = 0; i < 15; i++) {
    const service = services[Math.floor(Math.random() * services.length)]
    const person = createdData.persons[Math.floor(Math.random() * createdData.persons.length)]
    const org = createdData.organizations[Math.floor(Math.random() * createdData.organizations.length)]
    const stage = stages[Math.floor(Math.random() * stages.length)]
    
    if (!person || !org || !stage) {
      console.log('   ⚠️  Missing required data, skipping deal')
      continue
    }

    try {
      const variation = (Math.random() * 0.6) - 0.3 // ±30%
      const finalValue = Math.round(service.value * (1 + variation))
      
      const dealData = {
        title: `${service.type} - ${person.name}`,
        value: finalValue,
        currency: 'USD',
        person_id: person.id,
        org_id: org.id,
        stage_id: stage.id,
        status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'won' : 'lost') : 'open'
      }

      const response = await makeRequest('/deals', 'POST', dealData)
      
      if (response.success && response.data) {
        createdData.deals.push(response.data)
        console.log(`   ✅ Created: ${service.type} - $${finalValue}`)
      } else {
        console.log(`   ❌ Failed: ${service.type} - ${response.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${service.type} - ${error.message}`)
    }
    
    await delay(200)
  }

  // Create Activities
  console.log('\n📅 Creating Activities...')
  const activityTypes = ['call', 'meeting', 'task', 'email']
  const subjects = [
    'Follow up call with customer',
    'On-site consultation',
    'Prepare detailed quote',
    'Send quote to customer',
    'Schedule service appointment'
  ]

  for (let i = 0; i < 25; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    const subject = subjects[Math.floor(Math.random() * subjects.length)]
    const person = createdData.persons[Math.floor(Math.random() * createdData.persons.length)]
    const deal = createdData.deals[Math.floor(Math.random() * createdData.deals.length)]
    
    if (!person || !deal) {
      console.log('   ⚠️  Missing required data, skipping activity')
      continue
    }

    try {
      const isCompleted = Math.random() > 0.4
      const daysOffset = isCompleted ? 
        -Math.floor(Math.random() * 30) : 
        Math.floor(Math.random() * 45) + 1
      
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysOffset)
      
      const activityData = {
        type: type,
        subject: subject,
        person_id: person.id,
        deal_id: deal.id,
        due_date: dueDate.toISOString().split('T')[0],
        due_time: ['09:00', '10:00', '11:00', '14:00', '15:00'][Math.floor(Math.random() * 5)],
        done: isCompleted ? 1 : 0
      }

      const response = await makeRequest('/activities', 'POST', activityData)
      
      if (response.success && response.data) {
        createdData.activities.push(response.data)
        console.log(`   ✅ Created: ${subject} (${type})`)
      } else {
        console.log(`   ❌ Failed: ${subject} - ${response.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${subject} - ${error.message}`)
    }
    
    await delay(180)
  }

  return createdData
}

async function main() {
  console.log('🚀 PIPEDRIVE WIPE & SEED TOOL')
  console.log('=' .repeat(50))

  try {
    // Test connection
    const user = await makeRequest('/users/me')
    if (!user.success) {
      console.log('❌ Connection failed:', user.error)
      return
    }
    console.log(`✅ Connected as: ${user.data.name} (${user.data.company_name})`)

    // Find all existing data
    const allData = await findAllData()

    // Get stages first (needed for deals)
    const stages = await getStages()
    if (stages.length === 0) {
      console.log('❌ No stages found. Please create a pipeline with stages in Pipedrive first!')
      return
    }

    // Wipe existing data
    await wipeAllData(allData)

    // Wait a moment for deletions to process
    console.log('\n⏳ Waiting for deletions to process...')
    await delay(2000)

    // Seed fresh data
    const newData = await seedFreshData(stages)

    // Final summary
    console.log('\n🎉 SUCCESS!')
    console.log('=' .repeat(20))
    console.log(`✅ Created ${newData.organizations.length} Organizations`)
    console.log(`✅ Created ${newData.persons.length} Persons`)
    console.log(`✅ Created ${newData.deals.length} Deals`)
    console.log(`✅ Created ${newData.activities.length} Activities`)
    
    const totalValue = newData.deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    console.log(`💰 Total Pipeline Value: $${totalValue.toLocaleString()}`)

    console.log('\n🎯 Test your app now:')
    console.log('- Jobs: http://localhost:3000/dashboard/jobs')
    console.log('- Contacts: http://localhost:3000/dashboard/contacts')
    console.log('- Dashboard: http://localhost:3000/dashboard')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
  }
}

main()