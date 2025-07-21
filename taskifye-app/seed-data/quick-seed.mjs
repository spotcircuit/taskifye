import https from 'https'

const API_KEY = process.env.PIPEDRIVE_API_KEY || '2911f330137024c4d04b3e0256f67d7a83102f1a'

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
          reject(new Error('Invalid JSON response'))
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

console.log('🌱 Quick seed with correct fields...')

// Create organizations first
const orgs = [
  { name: 'Prime Properties LLC', address: '1234 Oak Ave, Austin, TX 78701' },
  { name: 'Metro Office Centers', address: '5678 Main St, Houston, TX 77001' },
  { name: 'Valley Medical Group', address: '3456 Cedar Ln, San Antonio, TX 78201' }
]

const createdOrgs = []

for (const org of orgs) {
  try {
    const response = await makeRequest('/organizations', 'POST', org)
    if (response.success && response.data) {
      createdOrgs.push(response.data)
      console.log(`✅ Created org: ${org.name}`)
    } else {
      console.log(`❌ Failed org: ${org.name} - ${response.error}`)
    }
  } catch (error) {
    console.log(`❌ Error org: ${org.name} - ${error.message}`)
  }
  await delay(200)
}

// Create persons
const persons = [
  { first: 'John', last: 'Smith', title: 'Facility Manager' },
  { first: 'Sarah', last: 'Johnson', title: 'Property Manager' },
  { first: 'Michael', last: 'Williams', title: 'Maintenance Director' }
]

const createdPersons = []

for (let i = 0; i < persons.length && i < createdOrgs.length; i++) {
  const person = persons[i]
  const org = createdOrgs[i]
  
  try {
    const personData = {
      name: `${person.first} ${person.last}`,
      email: [`${person.first.toLowerCase()}.${person.last.toLowerCase()}@company.com`],
      phone: ['(512) 555-0123'],
      job_title: person.title,
      org_id: org.id
    }

    const response = await makeRequest('/persons', 'POST', personData)
    if (response.success && response.data) {
      createdPersons.push(response.data)
      console.log(`✅ Created person: ${person.first} ${person.last}`)
    } else {
      console.log(`❌ Failed person: ${person.first} ${person.last} - ${response.error}`)
    }
  } catch (error) {
    console.log(`❌ Error person: ${person.first} ${person.last} - ${error.message}`)
  }
  await delay(200)
}

// Create a few deals
const services = ['HVAC Installation', 'HVAC Repair', 'Maintenance Contract']

for (let i = 0; i < 5 && createdPersons.length > 0 && createdOrgs.length > 0; i++) {
  const service = services[i % services.length]
  const person = createdPersons[i % createdPersons.length]
  const org = createdOrgs[i % createdOrgs.length]
  
  try {
    const dealData = {
      title: `${service} - ${person.name}`,
      value: Math.floor(Math.random() * 5000) + 1000,
      currency: 'USD',
      person_id: person.id,
      org_id: org.id,
      stage_id: 1 // First stage
    }

    const response = await makeRequest('/deals', 'POST', dealData)
    if (response.success && response.data) {
      console.log(`✅ Created deal: ${service} - $${dealData.value}`)
    } else {
      console.log(`❌ Failed deal: ${service} - ${response.error}`)
    }
  } catch (error) {
    console.log(`❌ Error deal: ${service} - ${error.message}`)
  }
  await delay(200)
}

console.log('✅ Quick seed completed! Check your app now.')