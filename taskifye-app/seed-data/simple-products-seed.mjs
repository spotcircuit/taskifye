#!/usr/bin/env node

// Simple Products and Deal Line Items seeding
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

async function createSimpleProducts() {
  console.log('🏪 Creating Simple Product Catalog...')

  const products = [
    // Equipment
    { name: '2-Ton AC Unit', code: 'AC-2T', prices: [{ price: 2800, currency: 'USD' }] },
    { name: '3-Ton AC Unit', code: 'AC-3T', prices: [{ price: 3500, currency: 'USD' }] },
    { name: 'Gas Furnace', code: 'FURN-GAS', prices: [{ price: 2500, currency: 'USD' }] },
    { name: 'Smart Thermostat', code: 'THERM', prices: [{ price: 250, currency: 'USD' }] },
    
    // Services
    { name: 'AC Installation', code: 'INST-AC', prices: [{ price: 1200, currency: 'USD' }] },
    { name: 'Furnace Installation', code: 'INST-FURN', prices: [{ price: 1000, currency: 'USD' }] },
    { name: 'HVAC Repair', code: 'REP-HVAC', prices: [{ price: 350, currency: 'USD' }] },
    { name: 'Maintenance Service', code: 'MAINT', prices: [{ price: 180, currency: 'USD' }] },
    { name: 'Emergency Service', code: 'EMERG', prices: [{ price: 450, currency: 'USD' }] },
    { name: 'Duct Cleaning', code: 'DUCT-CLEAN', prices: [{ price: 400, currency: 'USD' }] }
  ]

  const createdProducts = []

  for (const product of products) {
    try {
      const response = await makeRequest('/products', 'POST', product)
      
      if (response.success && response.data) {
        createdProducts.push(response.data)
        console.log(`   ✅ ${product.name} - $${product.prices[0].price}`)
      } else {
        console.log(`   ❌ ${product.name} - ${response.error}`)
      }
    } catch (error) {
      console.log(`   ❌ ${product.name} - ${error.message}`)
    }
    
    await delay(150)
  }

  return createdProducts
}

async function addProductsToExistingDeals(products) {
  console.log('\n💼 Adding Products to Existing Deals...')

  // Get existing deals
  const dealsResp = await makeRequest('/deals?limit=100')
  if (!dealsResp.success || !dealsResp.data || dealsResp.data.length === 0) {
    console.log('   ⚠️  No existing deals found')
    return
  }

  const deals = dealsResp.data
  console.log(`   📋 Found ${deals.length} existing deals`)

  // Define realistic product combinations
  const productCombos = [
    [
      { code: 'AC-3T', quantity: 1 },
      { code: 'INST-AC', quantity: 1 },
      { code: 'THERM', quantity: 1 }
    ],
    [
      { code: 'REP-HVAC', quantity: 1 },
      { code: 'MAINT', quantity: 1 }
    ],
    [
      { code: 'FURN-GAS', quantity: 1 },
      { code: 'INST-FURN', quantity: 1 }
    ],
    [
      { code: 'EMERG', quantity: 1 }
    ],
    [
      { code: 'DUCT-CLEAN', quantity: 1 },
      { code: 'MAINT', quantity: 2 }
    ]
  ]

  for (let i = 0; i < deals.length; i++) {
    const deal = deals[i]
    const combo = productCombos[i % productCombos.length]
    let totalValue = 0

    console.log(`\n   📋 Deal: ${deal.title}`)

    for (const item of combo) {
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

        const lineResponse = await makeRequest(`/deals/${deal.id}/products`, 'POST', lineItemData)
        
        if (lineResponse.success) {
          const lineTotal = product.prices[0].price * item.quantity
          totalValue += lineTotal
          console.log(`     ✅ ${product.name} × ${item.quantity} = $${lineTotal.toLocaleString()}`)
        } else {
          console.log(`     ❌ Failed: ${product.name} - ${lineResponse.error}`)
        }
      } catch (error) {
        console.log(`     ❌ Error: ${product.name} - ${error.message}`)
      }
      
      await delay(100)
    }

    // Update deal value
    if (totalValue > 0) {
      try {
        await makeRequest(`/deals/${deal.id}`, 'PUT', { value: totalValue })
        console.log(`     💰 Updated Deal Value: $${totalValue.toLocaleString()}`)
      } catch (error) {
        console.log(`     ⚠️  Could not update deal value: ${error.message}`)
      }
    }

    await delay(200)
  }
}

async function main() {
  console.log('🚀 SIMPLE PRODUCTS & LINE ITEMS SEEDING')
  console.log('=' .repeat(45))

  try {
    // Test connection
    const user = await makeRequest('/users/me')
    if (!user.success) {
      console.log('❌ Connection failed:', user.error)
      return
    }
    console.log(`✅ Connected as: ${user.data.name}`)

    // Create products
    const products = await createSimpleProducts()
    
    if (products.length === 0) {
      console.log('❌ No products created')
      return
    }

    console.log(`\n✅ Created ${products.length} products`)

    // Add products to existing deals
    await addProductsToExistingDeals(products)

    console.log('\n🎉 SUCCESS!')
    console.log('=' .repeat(20))
    console.log(`✅ Created ${products.length} Products`)
    console.log('✅ Added line items to existing deals')
    console.log('✅ Updated deal values with product totals')

    console.log('\n🎯 Check your app now:')
    console.log('- Jobs with Products: http://localhost:3000/dashboard/jobs')
    console.log('- Pipedrive Products: Settings → Products')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
  }
}

main()