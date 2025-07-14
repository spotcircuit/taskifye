#!/usr/bin/env node

// Comprehensive Pipedrive seeding with Products and Deal Line Items
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

async function createProducts() {
  console.log('🏪 Creating Product Catalog...')
  console.log('=' .repeat(40))

  const productCatalog = [
    // HVAC Equipment
    { 
      name: 'Carrier 2-Ton Central AC Unit', 
      code: 'CAR-AC-2T',
      unit: 'each',
      prices: [{ price: 2800, currency: 'USD' }],
      category: 'Equipment'
    },
    { 
      name: 'Carrier 3-Ton Central AC Unit', 
      code: 'CAR-AC-3T',
      unit: 'each',
      prices: [{ price: 3500, currency: 'USD' }],
      category: 'Equipment'
    },
    { 
      name: 'Carrier 4-Ton Central AC Unit', 
      code: 'CAR-AC-4T',
      unit: 'each',
      prices: [{ price: 4200, currency: 'USD' }],
      category: 'Equipment'
    },
    { 
      name: 'Trane Gas Furnace 80% AFUE', 
      code: 'TRA-FURN-80',
      unit: 'each',
      prices: [{ price: 2200, currency: 'USD' }],
      category: 'Equipment'
    },
    { 
      name: 'Trane Gas Furnace 95% AFUE', 
      code: 'TRA-FURN-95',
      unit: 'each',
      prices: [{ price: 3200, currency: 'USD' }],
      category: 'Equipment'
    },
    { 
      name: 'Programmable Thermostat', 
      code: 'THERM-PROG',
      unit: 'each',
      prices: [{ price: 150, currency: 'USD' }],
      category: 'Equipment'
    },
    { 
      name: 'Smart WiFi Thermostat', 
      code: 'THERM-WIFI',
      unit: 'each',
      prices: [{ price: 280, currency: 'USD' }],
      category: 'Equipment'
    },
    
    // Installation Services
    { 
      name: 'AC Unit Installation', 
      code: 'INST-AC',
      unit: 'job',
      prices: [{ price: 1200, currency: 'USD' }],
      category: 'Installation'
    },
    { 
      name: 'Furnace Installation', 
      code: 'INST-FURN',
      unit: 'job',
      prices: [{ price: 1000, currency: 'USD' }],
      category: 'Installation'
    },
    { 
      name: 'Thermostat Installation', 
      code: 'INST-THERM',
      unit: 'job',
      prices: [{ price: 150, currency: 'USD' }],
      category: 'Installation'
    },
    { 
      name: 'Ductwork Installation', 
      code: 'INST-DUCT',
      unit: 'linear_foot',
      prices: [{ price: 15, currency: 'USD' }],
      category: 'Installation'
    },
    
    // Repair Services
    { 
      name: 'AC Repair Service Call', 
      code: 'REP-AC',
      unit: 'hour',
      prices: [{ price: 125, currency: 'USD' }],
      category: 'Repair'
    },
    { 
      name: 'Furnace Repair Service Call', 
      code: 'REP-FURN',
      unit: 'hour',
      prices: [{ price: 125, currency: 'USD' }],
      category: 'Repair'
    },
    { 
      name: 'Emergency Service Call', 
      code: 'REP-EMERG',
      unit: 'hour',
      prices: [{ price: 185, currency: 'USD' }],
      category: 'Repair'
    },
    { 
      name: 'Refrigerant Recharge (R410A)', 
      code: 'REP-REFRIG',
      unit: 'pound',
      prices: [{ price: 85, currency: 'USD' }],
      category: 'Repair'
    },
    
    // Maintenance Services
    { 
      name: 'Annual HVAC Maintenance', 
      code: 'MAINT-ANNUAL',
      unit: 'visit',
      prices: [{ price: 180, currency: 'USD' }],
      category: 'Maintenance'
    },
    { 
      name: 'Bi-Annual Maintenance Plan', 
      code: 'MAINT-BIANNUAL',
      unit: 'year',
      prices: [{ price: 320, currency: 'USD' }],
      category: 'Maintenance'
    },
    { 
      name: 'Filter Replacement', 
      code: 'MAINT-FILTER',
      unit: 'each',
      prices: [{ price: 25, currency: 'USD' }],
      category: 'Maintenance'
    },
    { 
      name: 'Duct Cleaning Service', 
      code: 'MAINT-DUCT-CLEAN',
      unit: 'system',
      prices: [{ price: 450, currency: 'USD' }],
      category: 'Maintenance'
    },
    
    // Specialty Services
    { 
      name: 'Indoor Air Quality Assessment', 
      code: 'SPEC-IAQ',
      unit: 'assessment',
      prices: [{ price: 200, currency: 'USD' }],
      category: 'Specialty'
    },
    { 
      name: 'Energy Efficiency Audit', 
      code: 'SPEC-AUDIT',
      unit: 'audit',
      prices: [{ price: 350, currency: 'USD' }],
      category: 'Specialty'
    }
  ]

  const createdProducts = []

  for (const product of productCatalog) {
    try {
      const response = await makeRequest('/products', 'POST', product)
      
      if (response.success && response.data) {
        createdProducts.push(response.data)
        console.log(`   ✅ Created: ${product.name} - $${product.prices[0].price}`)
      } else {
        console.log(`   ❌ Failed: ${product.name} - ${response.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${product.name} - ${error.message}`)
    }
    
    await delay(100)
  }

  console.log(`\n✅ Created ${createdProducts.length} products`)
  return createdProducts
}

async function createDealsWithProducts(organizations, persons, products, stages) {
  console.log('\n💼 Creating Deals with Product Line Items...')
  console.log('=' .repeat(50))

  const createdDeals = []

  // Define realistic deal scenarios
  const dealScenarios = [
    {
      name: 'Full HVAC System Replacement',
      products: [
        { code: 'CAR-AC-3T', quantity: 1 },
        { code: 'TRA-FURN-95', quantity: 1 },
        { code: 'INST-AC', quantity: 1 },
        { code: 'INST-FURN', quantity: 1 },
        { code: 'THERM-WIFI', quantity: 1 },
        { code: 'INST-THERM', quantity: 1 }
      ]
    },
    {
      name: 'AC Unit Replacement',
      products: [
        { code: 'CAR-AC-2T', quantity: 1 },
        { code: 'INST-AC', quantity: 1 },
        { code: 'THERM-PROG', quantity: 1 },
        { code: 'INST-THERM', quantity: 1 }
      ]
    },
    {
      name: 'Emergency AC Repair',
      products: [
        { code: 'REP-EMERG', quantity: 2 },
        { code: 'REP-REFRIG', quantity: 3 }
      ]
    },
    {
      name: 'Annual Maintenance Contract',
      products: [
        { code: 'MAINT-BIANNUAL', quantity: 1 },
        { code: 'SPEC-IAQ', quantity: 1 }
      ]
    },
    {
      name: 'Furnace Installation',
      products: [
        { code: 'TRA-FURN-80', quantity: 1 },
        { code: 'INST-FURN', quantity: 1 },
        { code: 'INST-DUCT', quantity: 50 }
      ]
    },
    {
      name: 'Commercial HVAC Service',
      products: [
        { code: 'CAR-AC-4T', quantity: 2 },
        { code: 'INST-AC', quantity: 2 },
        { code: 'MAINT-DUCT-CLEAN', quantity: 1 },
        { code: 'SPEC-AUDIT', quantity: 1 }
      ]
    },
    {
      name: 'HVAC Repair Service',
      products: [
        { code: 'REP-AC', quantity: 3 },
        { code: 'MAINT-FILTER', quantity: 2 }
      ]
    },
    {
      name: 'Residential Maintenance',
      products: [
        { code: 'MAINT-ANNUAL', quantity: 1 },
        { code: 'MAINT-FILTER', quantity: 4 }
      ]
    }
  ]

  for (let i = 0; i < 12; i++) {
    const scenario = dealScenarios[i % dealScenarios.length]
    const person = persons[Math.floor(Math.random() * persons.length)]
    const org = organizations[Math.floor(Math.random() * organizations.length)]
    const stage = stages[Math.floor(Math.random() * stages.length)]

    try {
      // Create the deal first
      const dealData = {
        title: `${scenario.name} - ${person.name}`,
        person_id: person.id,
        org_id: org.id,
        stage_id: stage.id,
        status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'won' : 'lost') : 'open'
      }

      const dealResponse = await makeRequest('/deals', 'POST', dealData)
      
      if (!dealResponse.success || !dealResponse.data) {
        console.log(`   ❌ Failed to create deal: ${scenario.name}`)
        continue
      }

      const deal = dealResponse.data
      let totalValue = 0

      console.log(`\n   📋 Creating: ${scenario.name}`)

      // Add products to the deal
      for (const item of scenario.products) {
        const product = products.find(p => p.code === item.code)
        if (!product) {
          console.log(`     ⚠️  Product not found: ${item.code}`)
          continue
        }

        try {
          const lineItemData = {
            deal_id: deal.id,
            product_id: product.id,
            item_price: product.prices[0].price,
            quantity: item.quantity
          }

          const lineResponse = await makeRequest('/deals/' + deal.id + '/products', 'POST', lineItemData)
          
          if (lineResponse.success) {
            const lineTotal = product.prices[0].price * item.quantity
            totalValue += lineTotal
            console.log(`     ✅ ${product.name} × ${item.quantity} = $${lineTotal.toLocaleString()}`)
          } else {
            console.log(`     ❌ Failed to add ${product.name}: ${lineResponse.error}`)
          }
        } catch (error) {
          console.log(`     ❌ Error adding ${product.name}: ${error.message}`)
        }
        
        await delay(100)
      }

      // Update deal value
      if (totalValue > 0) {
        try {
          await makeRequest(`/deals/${deal.id}`, 'PUT', { value: totalValue })
          console.log(`   💰 Total Deal Value: $${totalValue.toLocaleString()}`)
        } catch (error) {
          console.log(`   ⚠️  Could not update deal value: ${error.message}`)
        }
      }

      createdDeals.push(deal)

    } catch (error) {
      console.log(`   ❌ Error creating deal: ${scenario.name} - ${error.message}`)
    }
    
    await delay(200)
  }

  console.log(`\n✅ Created ${createdDeals.length} deals with product line items`)
  return createdDeals
}

async function main() {
  console.log('🚀 PIPEDRIVE SEEDING WITH PRODUCTS')
  console.log('=' .repeat(50))

  try {
    // Test connection
    const user = await makeRequest('/users/me')
    if (!user.success) {
      console.log('❌ Connection failed:', user.error)
      return
    }
    console.log(`✅ Connected as: ${user.data.name} (${user.data.company_name})`)

    // Get existing data
    console.log('\n📊 Checking existing data...')
    const [orgsResp, personsResp, stagesResp] = await Promise.all([
      makeRequest('/organizations?limit=100'),
      makeRequest('/persons?limit=100'),
      makeRequest('/stages')
    ])

    const organizations = orgsResp.success ? orgsResp.data : []
    const persons = personsResp.success ? personsResp.data : []
    const stages = stagesResp.success ? stagesResp.data : []

    console.log(`   📋 Found ${organizations.length} organizations`)
    console.log(`   📋 Found ${persons.length} persons`)
    console.log(`   📋 Found ${stages.length} stages`)

    if (organizations.length === 0 || persons.length === 0) {
      console.log('\n⚠️  You need organizations and persons first!')
      console.log('   Run: node quick-seed.mjs')
      return
    }

    if (stages.length === 0) {
      console.log('\n❌ No stages found. Please create a pipeline with stages in Pipedrive first!')
      return
    }

    // Create products
    const products = await createProducts()
    
    if (products.length === 0) {
      console.log('❌ No products created, cannot create deals with line items')
      return
    }

    // Create deals with products
    const deals = await createDealsWithProducts(organizations, persons, products, stages)

    // Final summary
    console.log('\n🎉 SUCCESS!')
    console.log('=' .repeat(20))
    console.log(`✅ Created ${products.length} Products`)
    console.log(`✅ Created ${deals.length} Deals with Line Items`)
    console.log(`📊 Using ${organizations.length} Organizations & ${persons.length} Persons`)

    console.log('\n🎯 Your Pipedrive now has:')
    console.log('- Complete HVAC product catalog')
    console.log('- Realistic deals with actual line items')
    console.log('- Proper pricing and quantities')
    console.log('- Equipment, services, and maintenance offerings')

    console.log('\n🌐 Test your app:')
    console.log('- Jobs with Products: http://localhost:3000/dashboard/jobs')
    console.log('- Product Catalog: Check Pipedrive Settings → Products')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
  }
}

main()