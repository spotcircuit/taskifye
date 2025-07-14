// Execute Pipedrive data seeding with active API key
const fs = require('fs');

// Try to read the API key from various sources
let API_KEY = '';

// Check if there's a .env file
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const pipedriveMatch = envContent.match(/PIPEDRIVE_API_KEY=(.+)/);
  if (pipedriveMatch) {
    API_KEY = pipedriveMatch[1].replace(/["']/g, '');
  }
} catch (e) {
  // No .env file or error reading it
}

// If no API key found in env, prompt user
if (!API_KEY) {
  console.log(`
🔑 PIPEDRIVE API KEY NEEDED

I need your Pipedrive API key to seed the data. You can:

1. Create a .env.local file with:
   PIPEDRIVE_API_KEY=your_api_key_here

2. Or run with environment variable:
   PIPEDRIVE_API_KEY=your_key node run-seeder.js

3. Or get your API key from:
   Pipedrive → Settings → Personal preferences → API

Since you mentioned the API key is active, please run one of the above options.
`);
  process.exit(1);
}

console.log('🚀 Starting data seeding with active API key...');

// Import the seeding logic
const https = require('https');

const BASE_URL = 'https://api.pipedrive.com/v1';

function makeAPICall(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}?api_token=${API_KEY}`;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Sample data for HVAC business
const sampleData = {
  organizations: [
    { name: 'Prime Properties LLC', address: '1234 Oak Ave, Austin, TX 78701', phone: '(512) 555-0101' },
    { name: 'Metro Office Centers', address: '5678 Main St, Houston, TX 77001', phone: '(713) 555-0102' },
    { name: 'Sunset Mall Management', address: '9012 Park Blvd, Dallas, TX 75201', phone: '(214) 555-0103' },
    { name: 'Valley Medical Group', address: '3456 Cedar Ln, San Antonio, TX 78201', phone: '(210) 555-0104' },
    { name: 'Lincoln School District', address: '7890 Elm St, Fort Worth, TX 76101', phone: '(817) 555-0105' }
  ],
  persons: [
    { name: 'John Smith', title: 'Facility Manager', email: 'john.smith@primeproperties.com' },
    { name: 'Sarah Johnson', title: 'Property Manager', email: 'sarah.johnson@metrooffice.com' },
    { name: 'Michael Williams', title: 'Maintenance Director', email: 'michael.williams@sunsetmall.com' },
    { name: 'Lisa Brown', title: 'Operations Manager', email: 'lisa.brown@valleymedical.com' },
    { name: 'David Jones', title: 'Facilities Coordinator', email: 'david.jones@lincolnschools.edu' }
  ],
  services: [
    { type: 'HVAC Installation', baseValue: 8000 },
    { type: 'HVAC Repair', baseValue: 450 },
    { type: 'HVAC Maintenance', baseValue: 200 },
    { type: 'Air Conditioning Service', baseValue: 300 },
    { type: 'Heating System Repair', baseValue: 350 }
  ]
};

async function executeSeedingNow() {
  console.log('🌱 EXECUTING PIPEDRIVE DATA SEEDING');
  console.log('=====================================');

  try {
    // Test API connection first
    console.log('🔍 Testing API connection...');
    const testResponse = await makeAPICall('/users/me');
    if (!testResponse.success) {
      throw new Error('API key is invalid or expired');
    }
    console.log(`✅ Connected as: ${testResponse.data.name}`);

    const results = {
      organizations: [],
      persons: [],
      deals: [],
      activities: []
    };

    // Create Organizations
    console.log('\n📢 Creating Organizations...');
    for (const org of sampleData.organizations) {
      try {
        const result = await makeAPICall('/organizations', 'POST', {
          name: org.name,
          address: org.address,
          phone: org.phone,
          email: `info@${org.name.toLowerCase().replace(/\s+/g, '')}.com`
        });
        
        if (result.success) {
          results.organizations.push(result.data);
          console.log(`  ✓ ${org.name}`);
        }
      } catch (error) {
        console.log(`  ✗ ${org.name}: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Create Persons
    console.log('\n👥 Creating Persons...');
    for (let i = 0; i < sampleData.persons.length; i++) {
      const person = sampleData.persons[i];
      const org = results.organizations[i] || results.organizations[0];
      
      try {
        const result = await makeAPICall('/persons', 'POST', {
          name: person.name,
          email: person.email,
          phone: `(512) 555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          job_title: person.title,
          org_id: org?.id
        });
        
        if (result.success) {
          results.persons.push(result.data);
          console.log(`  ✓ ${person.name} (${person.title})`);
        }
      } catch (error) {
        console.log(`  ✗ ${person.name}: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Create Deals
    console.log('\n💼 Creating Deals...');
    for (let i = 0; i < 20; i++) {
      const service = sampleData.services[Math.floor(Math.random() * sampleData.services.length)];
      const person = results.persons[Math.floor(Math.random() * results.persons.length)];
      const org = results.organizations[Math.floor(Math.random() * results.organizations.length)];
      
      if (person && org) {
        const value = service.baseValue + (Math.random() * service.baseValue * 0.5);
        
        try {
          const result = await makeAPICall('/deals', 'POST', {
            title: `${service.type} - ${person.name}`,
            value: Math.round(value),
            currency: 'USD',
            person_id: person.id,
            org_id: org.id,
            stage_id: Math.floor(Math.random() * 3) + 1
          });
          
          if (result.success) {
            results.deals.push(result.data);
            console.log(`  ✓ ${service.type} - $${Math.round(value)}`);
          }
        } catch (error) {
          console.log(`  ✗ ${service.type}: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }

    // Create Activities
    console.log('\n📅 Creating Activities...');
    const activityTypes = ['call', 'meeting', 'task', 'email'];
    const subjects = ['Follow up call', 'On-site consultation', 'Prepare quote', 'Send estimate'];
    
    for (let i = 0; i < 30; i++) {
      const person = results.persons[Math.floor(Math.random() * results.persons.length)];
      const deal = results.deals[Math.floor(Math.random() * results.deals.length)];
      
      if (person && deal) {
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        
        // Generate future date
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
        
        try {
          const result = await makeAPICall('/activities', 'POST', {
            type: type,
            subject: `${subject} - ${person.name}`,
            person_id: person.id,
            deal_id: deal.id,
            due_date: futureDate.toISOString().split('T')[0],
            due_time: '10:00'
          });
          
          if (result.success) {
            results.activities.push(result.data);
            console.log(`  ✓ ${subject} (${type})`);
          }
        } catch (error) {
          console.log(`  ✗ ${subject}: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Success summary
    console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('===================================');
    console.log(`📊 Results:`);
    console.log(`   📢 ${results.organizations.length} Organizations`);
    console.log(`   👥 ${results.persons.length} Persons`);
    console.log(`   💼 ${results.deals.length} Deals`);
    console.log(`   📅 ${results.activities.length} Activities`);
    
    const totalValue = results.deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    console.log(`   💰 Total Value: $${totalValue.toLocaleString()}`);
    
    console.log('\n🎯 Your Taskifye CRM is now populated!');
    console.log('Visit: http://localhost:3000/dashboard');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('Please check your API key and try again.');
  }
}

// Run the seeding
executeSeedingNow();