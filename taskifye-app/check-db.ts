import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    // Get all clients
    const clients = await prisma.client.findMany({
      include: {
        apiSettings: true
      }
    })
    
    console.log('\n=== DATABASE CHECK RESULTS ===')
    console.log(`Total clients found: ${clients.length}`)
    
    console.log('\n=== ALL CLIENTS ===')
    clients.forEach((client, index) => {
      console.log(`\n${index + 1}. ${client.name}`)
      console.log(`   ID: ${client.id}`)
      console.log(`   Slug: ${client.slug}`)
      console.log(`   Business Type: ${client.businessType}`)
      
      if (client.apiSettings) {
        console.log('   API Settings:')
        console.log('     - Pipedrive Key: ' + (client.apiSettings.pipedriveApiKey ? '✓ SET' : '✗ NOT SET'))
        console.log('     - Pipedrive Domain: ' + (client.apiSettings.pipedriveCompanyDomain || 'NOT SET'))
        console.log('     - ReachInbox Key: ' + (client.apiSettings.reachInboxApiKey ? '✓ SET' : '✗ NOT SET'))
        console.log('     - Twilio SID: ' + (client.apiSettings.twilioAccountSid ? '✓ SET' : '✗ NOT SET'))
      } else {
        console.log('   API Settings: ✗ NONE')
      }
    })
    
    // Find Premium Painting Co specifically
    const premiumPainting = clients.find(c => c.name === 'Premium Painting Co')
    if (premiumPainting) {
      console.log('\n=== PREMIUM PAINTING CO DETAILS ===')
      console.log('Client ID:', premiumPainting.id)
      console.log('This is the client with API keys configured')
      console.log('\nTo use this client, set localStorage in your browser:')
      console.log(`localStorage.setItem('current_client_id', '${premiumPainting.id}')`)
    }
    
    console.log('\n=== USAGE INSTRUCTIONS ===')
    console.log('1. Open browser DevTools Console')
    console.log('2. Check current client: localStorage.getItem("current_client_id")')
    console.log('3. Switch to Premium Painting Co:')
    if (premiumPainting) {
      console.log(`   localStorage.setItem('current_client_id', '${premiumPainting.id}')`)
    }
    console.log('4. Refresh the page')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()