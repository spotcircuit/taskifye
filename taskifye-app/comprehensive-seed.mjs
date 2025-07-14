#!/usr/bin/env node

// Comprehensive seeding with more organizations, persons, and varied deals
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

async function main() {
  console.log('🚀 COMPREHENSIVE SEEDING')
  console.log('=' .repeat(30))

  try {
    // Test connection
    const user = await makeRequest('/users/me')
    if (!user.success) {
      console.log('❌ Connection failed:', user.error)
      return
    }
    console.log(`✅ Connected as: ${user.data.name}`)

    // Get existing products (we already created them)
    const productsResp = await makeRequest('/products?limit=100')
    const products = productsResp.success ? productsResp.data : []
    console.log(`📦 Found ${products.length} products`)

    // Create more organizations
    console.log('\n🏢 Creating Organizations...')
    const organizations = [
      { name: 'Brookstone Medical Center', address: '4567 Medical Blvd, Austin, TX 78702' },
      { name: 'Westfield Shopping Mall', address: '8901 Commerce St, Houston, TX 77002' },
      { name: 'Cedar Ridge Office Complex', address: '2345 Business Park Dr, Dallas, TX 75202' },
      { name: 'Sunrise Elementary School', address: '6789 Education Ave, San Antonio, TX 78202' },
      { name: 'Heritage Senior Living', address: '1234 Retirement Rd, Fort Worth, TX 76102' },
      { name: 'TechFlow Manufacturing', address: '5678 Industrial Way, El Paso, TX 79902' },
      { name: 'Golden Oaks Restaurant Group', address: '9012 Restaurant Row, Arlington, TX 76002' },
      { name: 'Pinnacle Fitness Centers', address: '3456 Workout St, Plano, TX 75002' }
    ]

    const createdOrgs = []
    for (const org of organizations) {
      try {
        const response = await makeRequest('/organizations', 'POST', org)
        if (response.success && response.data) {
          createdOrgs.push(response.data)
          console.log(`   ✅ ${org.name}`)
        }
      } catch (error) {
        console.log(`   ❌ ${org.name} - ${error.message}`)
      }
      await delay(150)
    }

    // Create more persons
    console.log('\n👥 Creating Persons...')
    const persons = [
      { first: 'Jennifer', last: 'Garcia', title: 'Facilities Director' },
      { first: 'Robert', last: 'Miller', title: 'Property Manager' },
      { first: 'Emily', last: 'Davis', title: 'Office Manager' },
      { first: 'James', last: 'Rodriguez', title: 'Maintenance Supervisor' },
      { first: 'Ashley', last: 'Wilson', title: 'Building Owner' },
      { first: 'Christopher', last: 'Anderson', title: 'Operations Manager' },
      { first: 'Michelle', last: 'Thomas', title: 'Facility Coordinator' },
      { first: 'Daniel', last: 'Jackson', title: 'Site Manager' },
      { first: 'Amanda', last: 'White', title: 'Property Owner' },
      { first: 'Matthew', last: 'Martin', title: 'General Manager' },
      { first: 'Jessica', last: 'Thompson', title: 'Administrative Director' },
      { first: 'Andrew', last: 'Garcia', title: 'Facilities Manager' }
    ]

    function generatePhone() {
      const areaCodes = ['512', '713', '214', '210', '817', '915', '469', '361']
      const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)]
      const exchange = Math.floor(Math.random() * 900) + 100
      const number = Math.floor(Math.random() * 9000) + 1000
      return `(${areaCode}) ${exchange}-${number}`
    }

    const createdPersons = []
    for (let i = 0; i < persons.length; i++) {
      const person = persons[i]
      const org = createdOrgs[i % createdOrgs.length]
      
      if (!org) continue

      try {
        const personData = {
          name: `${person.first} ${person.last}`,
          email: [`${person.first.toLowerCase()}.${person.last.toLowerCase()}@${org.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`],
          phone: [generatePhone()],
          job_title: person.title,
          org_id: org.id
        }

        const response = await makeRequest('/persons', 'POST', personData)
        if (response.success && response.data) {
          createdPersons.push(response.data)
          console.log(`   ✅ ${person.first} ${person.last} - ${org.name}`)
        }
      } catch (error) {
        console.log(`   ❌ ${person.first} ${person.last} - ${error.message}`)
      }
      await delay(150)
    }

    // Create varied deals with products
    console.log('\n💼 Creating Deals with Products...')
    
    const dealScenarios = [
      { name: 'Emergency AC Repair', products: ['Emergency Service'], customerType: 'existing' },
      { name: 'New HVAC Installation', products: ['3-Ton AC Unit', 'AC Installation', 'Smart Thermostat'], customerType: 'new' },
      { name: 'Maintenance Contract', products: ['Maintenance Service'], customerType: 'existing' },
      { name: 'Furnace Replacement', products: ['Gas Furnace', 'Furnace Installation'], customerType: 'existing' },
      { name: 'Commercial HVAC Service', products: ['Duct Cleaning', 'Maintenance Service'], customerType: 'new' },
      { name: 'Thermostat Upgrade', products: ['Smart Thermostat'], customerType: 'existing' },
      { name: 'System Tune-Up', products: ['Maintenance Service'], customerType: 'existing' },
      { name: 'AC Unit Replacement', products: ['2-Ton AC Unit', 'AC Installation'], customerType: 'new' }
    ]

    const stages = await makeRequest('/stages')
    const stageList = stages.success ? stages.data : []
    
    // Create 20 deals with varied scenarios
    let customersCreated = 0
    let leadsCreated = 0

    for (let i = 0; i < 20; i++) {
      const scenario = dealScenarios[i % dealScenarios.length]
      const person = createdPersons[Math.floor(Math.random() * createdPersons.length)]
      const org = createdOrgs[Math.floor(Math.random() * createdOrgs.length)]
      const stage = stageList[Math.floor(Math.random() * stageList.length)]
      
      if (!person || !org || !stage) continue

      // Decide if this should be a customer (has deal) or lead (no deal yet)
      const shouldCreateDeal = scenario.customerType === 'existing' || Math.random() > 0.3

      if (shouldCreateDeal) {
        try {
          const dealData = {
            title: `${scenario.name} - ${person.name}`,
            person_id: person.id,
            org_id: org.id,
            stage_id: stage.id,
            status: Math.random() > 0.85 ? (Math.random() > 0.5 ? 'won' : 'lost') : 'open'
          }

          const dealResponse = await makeRequest('/deals', 'POST', dealData)
          
          if (dealResponse.success && dealResponse.data) {
            const deal = dealResponse.data
            let totalValue = 0

            // Add products to deal
            for (const productName of scenario.products) {
              const product = products.find(p => p.name.includes(productName))
              if (product) {
                try {
                  const lineItemData = {
                    deal_id: deal.id,
                    product_id: product.id,
                    item_price: product.prices[0].price,
                    quantity: 1
                  }

                  const lineResponse = await makeRequest(`/deals/${deal.id}/products`, 'POST', lineItemData)
                  if (lineResponse.success) {
                    totalValue += product.prices[0].price
                  }
                } catch (error) {
                  // Continue if product addition fails
                }
                await delay(50)
              }
            }

            // Update deal value
            if (totalValue > 0) {
              await makeRequest(`/deals/${deal.id}`, 'PUT', { value: totalValue })
            }

            console.log(`   ✅ Customer: ${scenario.name} - $${totalValue.toLocaleString()}`)
            customersCreated++
          }
        } catch (error) {
          console.log(`   ❌ Deal error: ${scenario.name}`)
        }
      } else {
        console.log(`   📋 Lead: ${person.name} (${org.name})`)
        leadsCreated++
      }
      
      await delay(200)
    }

    console.log('\n🎉 SUCCESS!')
    console.log('=' .repeat(20))
    console.log(`✅ Created ${createdOrgs.length} Organizations`)
    console.log(`✅ Created ${createdPersons.length} Persons`)
    console.log(`✅ Created ~${customersCreated} Customers (with deals)`)
    console.log(`✅ Created ~${leadsCreated} Leads (no deals yet)`)

    console.log('\n📊 Expected Results:')
    console.log(`- Total Contacts: ${createdPersons.length}`)
    console.log(`- Customers: ~${customersCreated} (have deals)`)
    console.log(`- Leads: ~${leadsCreated} (no deals)`)

    console.log('\n🎯 Check your app:')
    console.log('- Contacts: http://localhost:3000/dashboard/contacts')
    console.log('- Jobs: http://localhost:3000/dashboard/jobs')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
  }
}

main()