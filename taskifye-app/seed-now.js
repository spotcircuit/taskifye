// Simple data seeding script for immediate execution
const https = require('https')

// You'll need to replace this with your actual Pipedrive API key
const API_KEY = 'YOUR_PIPEDRIVE_API_KEY'
const BASE_URL = 'https://api.pipedrive.com/v1'

// Helper function to make API requests
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}?api_token=${API_KEY}`
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
          reject(e)
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

// Sample data arrays
const companyNames = [
  'Prime Properties LLC', 'Metro Office Centers', 'Sunset Mall Management',
  'Industrial Solutions Inc', 'Valley Medical Group', 'Lincoln School District',
  'Golden Gate Restaurants', 'Riverside Apartments', 'Grand Hotel Group',
  'Logistics Pro Warehousing', 'Elite Commercial Real Estate', 'Downtown Business Park'
]

const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily',
  'James', 'Jessica', 'William', 'Ashley', 'Richard', 'Amanda', 'Thomas'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson'
]

const serviceTypes = [
  'HVAC Installation', 'HVAC Repair', 'HVAC Maintenance', 'Heating System Repair',
  'Air Conditioning Service', 'Ductwork Installation', 'Thermostat Installation',
  'Indoor Air Quality', 'Heat Pump Service', 'Boiler Repair'
]

// Helper functions
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function generatePhone() {
  const areaCode = ['512', '713', '214', '210', '817'][Math.floor(Math.random() * 5)]
  const exchange = Math.floor(Math.random() * 900) + 100
  const number = Math.floor(Math.random() * 9000) + 1000
  return `${areaCode}${exchange}${number}`
}

function generateAddress() {
  const number = Math.floor(Math.random() * 9999) + 1
  const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Cedar Ln']
  const cities = ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth']
  return `${number} ${getRandomItem(streets)}, ${getRandomItem(cities)}, TX`
}

function getServiceValue(serviceType) {
  const valueMap = {
    'HVAC Installation': 8000,
    'HVAC Repair': 450,
    'HVAC Maintenance': 200,
    'Heating System Repair': 350,
    'Air Conditioning Service': 300,
    'Ductwork Installation': 3500,
    'Thermostat Installation': 250,
    'Indoor Air Quality': 800,
    'Heat Pump Service': 400,
    'Boiler Repair': 600
  }
  const base = valueMap[serviceType] || 500
  return Math.round(base + (Math.random() * base * 0.5))
}

async function seedData() {
  console.log('🌱 Starting Pipedrive data seeding...')
  
  if (API_KEY === 'YOUR_PIPEDRIVE_API_KEY') {
    console.log(`
❌ Please update the API_KEY variable in this script with your actual Pipedrive API key.

To get your API key:
1. Go to your Pipedrive account
2. Click on your profile picture (top right)
3. Go to Company settings > Personal preferences > API
4. Copy your API token
5. Replace 'YOUR_PIPEDRIVE_API_KEY' in this script

Then run: node seed-now.js
`)
    return
  }

  try {
    console.log('📢 Creating organizations...')
    const organizations = []
    
    for (let i = 0; i < 12; i++) {
      const orgData = {
        name: companyNames[i],
        address: generateAddress(),
        phone: generatePhone(),
        email: `info@${companyNames[i].toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`
      }
      
      const result = await makeRequest('/organizations', 'POST', orgData)
      if (result.success) {
        organizations.push(result.data)
        console.log(`  ✓ Created: ${orgData.name}`)
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log('👥 Creating persons...')
    const persons = []
    
    for (let i = 0; i < 25; i++) {
      const firstName = getRandomItem(firstNames)
      const lastName = getRandomItem(lastNames)
      const org = getRandomItem(organizations)
      
      const personData = {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${org.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
        phone: generatePhone(),
        org_id: org.id
      }
      
      const result = await makeRequest('/persons', 'POST', personData)
      if (result.success) {
        persons.push(result.data)
        console.log(`  ✓ Created: ${personData.name}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log('💼 Creating deals...')
    const deals = []
    
    for (let i = 0; i < 50; i++) {
      const person = getRandomItem(persons)
      const org = getRandomItem(organizations)
      const serviceType = getRandomItem(serviceTypes)
      const value = getServiceValue(serviceType)
      
      const dealData = {
        title: `${serviceType} - ${person.name}`,
        value: value,
        currency: 'USD',
        person_id: person.id,
        org_id: org.id,
        stage_id: Math.floor(Math.random() * 5) + 1
      }
      
      const result = await makeRequest('/deals', 'POST', dealData)
      if (result.success) {
        deals.push(result.data)
        console.log(`  ✓ Created: ${dealData.title} ($${dealData.value})`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log('📅 Creating activities...')
    const activityTypes = ['call', 'meeting', 'task', 'email']
    const subjects = {
      call: ['Follow up call', 'Schedule appointment', 'Quote discussion'],
      meeting: ['On-site consultation', 'Project meeting', 'Final inspection'],
      task: ['Prepare quote', 'Order equipment', 'Schedule technician'],
      email: ['Send quote', 'Confirmation email', 'Invoice delivery']
    }
    
    for (let i = 0; i < 75; i++) {
      const type = getRandomItem(activityTypes)
      const person = getRandomItem(persons)
      const deal = getRandomItem(deals)
      const subject = getRandomItem(subjects[type])
      
      // Generate future date (1-30 days)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1)
      
      const activityData = {
        type: type,
        subject: subject,
        person_id: person.id,
        deal_id: deal.id,
        due_date: futureDate.toISOString().split('T')[0],
        due_time: '10:00'
      }
      
      const result = await makeRequest('/activities', 'POST', activityData)
      if (result.success) {
        console.log(`  ✓ Created: ${subject}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    console.log(`
✅ Data seeding completed successfully!

📊 Summary:
   📢 ${organizations.length} Organizations created
   👥 ${persons.length} Persons created  
   💼 ${deals.length} Deals created
   📅 ~75 Activities created

🎯 Next steps:
1. Go to your Taskifye dashboard: http://localhost:3000/dashboard
2. Visit Jobs page to see the drag-drop pipeline
3. Check Activity Feed on the main dashboard
4. Explore Contacts and Reports pages
5. Test the real-time sync between Taskifye and Pipedrive

Your CRM is now populated with realistic HVAC service business data!
`)

  } catch (error) {
    console.error('❌ Error during seeding:', error.message)
  }
}

seedData()