const { seedPipedriveData } = require('../src/lib/data/pipedrive-seeder.ts')

async function runSeeding() {
  console.log('🌱 Starting Pipedrive data seeding...')
  
  // Get API key from localStorage equivalent or environment
  const apiKey = process.env.PIPEDRIVE_API_KEY || 'your-api-key-here'
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.error('❌ Please set PIPEDRIVE_API_KEY environment variable')
    process.exit(1)
  }

  try {
    const result = await seedPipedriveData(apiKey, {
      organizations: 20,
      persons: 45,
      deals: 100,
      activities: 200
    })
    
    console.log('✅ Data seeding completed successfully!')
    console.log(`📊 Created:`)
    console.log(`   📢 ${result.organizations} Organizations`)
    console.log(`   👥 ${result.persons} Persons`)
    console.log(`   💼 ${result.deals} Deals`)
    console.log(`   📅 ${result.activities} Activities`)
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message)
    process.exit(1)
  }
}

runSeeding()