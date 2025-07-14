import { promises as fs } from 'fs';
import path from 'path';

// Read the stored API key from the browser's localStorage equivalent
// Since we can't access localStorage directly, we'll use environment or prompt
const API_KEY = process.env.PIPEDRIVE_API_KEY || '';

if (!API_KEY) {
  console.log(`
🔑 Pipedrive API Key Required

To execute data seeding, I need your Pipedrive API key.
You can either:

1. Set environment variable:
   export PIPEDRIVE_API_KEY="your-api-key-here"
   node execute-seeding.mjs

2. Or edit this file and add your key directly

To get your API key:
- Go to Pipedrive → Settings → Personal preferences → API
- Copy your API token
`);
  process.exit(1);
}

// Import required modules for HTTP requests
import https from 'https';

const BASE_URL = 'https://api.pipedrive.com/v1';

// Helper function to make API requests
function apiRequest(endpoint, method = 'GET', data = null) {
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
          if (parsed.success) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error || 'API request failed'));
          }
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

// Data arrays for realistic HVAC business
const organizations = [
  { name: 'Prime Properties LLC', type: 'Property Management' },
  { name: 'Metro Office Centers', type: 'Commercial Office' },
  { name: 'Sunset Mall Management', type: 'Retail Center' },
  { name: 'Industrial Solutions Inc', type: 'Manufacturing' },
  { name: 'Valley Medical Group', type: 'Healthcare' },
  { name: 'Lincoln School District', type: 'Education' },
  { name: 'Golden Gate Restaurants', type: 'Restaurant Chain' },
  { name: 'Riverside Apartments', type: 'Residential' },
  { name: 'Grand Hotel Group', type: 'Hospitality' },
  { name: 'Logistics Pro Warehousing', type: 'Warehouse' },
  { name: 'Elite Commercial Real Estate', type: 'Real Estate' },
  { name: 'Downtown Business Park', type: 'Business Park' },
  { name: 'Texas State University', type: 'Education' },
  { name: 'Memorial Hospital System', type: 'Healthcare' },
  { name: 'Austin Tech Hub', type: 'Technology' }
];

const people = [
  { first: 'John', last: 'Smith', title: 'Facility Manager' },
  { first: 'Sarah', last: 'Johnson', title: 'Property Manager' },
  { first: 'Michael', last: 'Williams', title: 'Maintenance Director' },
  { first: 'Lisa', last: 'Brown', title: 'Operations Manager' },
  { first: 'David', last: 'Jones', title: 'Building Owner' },
  { first: 'Jennifer', last: 'Garcia', title: 'General Manager' },
  { first: 'Robert', last: 'Miller', title: 'Site Supervisor' },
  { first: 'Emily', last: 'Davis', title: 'Office Manager' },
  { first: 'James', last: 'Rodriguez', title: 'Facilities Coordinator' },
  { first: 'Jessica', last: 'Martinez', title: 'Property Owner' },
  { first: 'William', last: 'Hernandez', title: 'Regional Manager' },
  { first: 'Ashley', last: 'Lopez', title: 'Administrative Assistant' },
  { first: 'Richard', last: 'Gonzalez', title: 'Operations Director' },
  { first: 'Amanda', last: 'Wilson', title: 'Building Superintendent' },
  { first: 'Thomas', last: 'Anderson', title: 'Project Manager' },
  { first: 'Michelle', last: 'Thomas', title: 'Facility Coordinator' },
  { first: 'Charles', last: 'Taylor', title: 'Maintenance Manager' },
  { first: 'Stephanie', last: 'Moore', title: 'Site Manager' },
  { first: 'Daniel', last: 'Jackson', title: 'Operations Coordinator' },
  { first: 'Laura', last: 'Martin', title: 'Building Manager' }
];

const services = [
  { type: 'HVAC Installation', value: 8000, duration: '8-12 hours' },
  { type: 'HVAC Repair', value: 450, duration: '2-4 hours' },
  { type: 'HVAC Maintenance', value: 200, duration: '1-2 hours' },
  { type: 'Heating System Repair', value: 350, duration: '2-3 hours' },
  { type: 'Air Conditioning Service', value: 300, duration: '1-3 hours' },
  { type: 'Ductwork Installation', value: 3500, duration: '6-10 hours' },
  { type: 'Thermostat Installation', value: 250, duration: '1 hour' },
  { type: 'Indoor Air Quality Service', value: 800, duration: '2-4 hours' },
  { type: 'Heat Pump Service', value: 400, duration: '2-3 hours' },
  { type: 'Boiler Repair', value: 600, duration: '3-5 hours' },
  { type: 'Furnace Replacement', value: 4500, duration: '6-8 hours' },
  { type: 'AC Unit Replacement', value: 5500, duration: '4-8 hours' },
  { type: 'Emergency HVAC Service', value: 750, duration: '1-4 hours' },
  { type: 'Commercial HVAC Service', value: 12000, duration: '1-3 days' },
  { type: 'Preventive Maintenance', value: 180, duration: '1-2 hours' }
];

// Helper functions
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePhone() {
  const areaCodes = ['512', '713', '214', '210', '817', '915', '469', '361'];
  const areaCode = randomItem(areaCodes);
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${exchange}-${number}`;
}

function generateAddress() {
  const numbers = Math.floor(Math.random() * 9999) + 1;
  const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Second Ave', 'Elm St', 'Maple Ave', 'Cedar Ln'];
  const cities = ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'];
  return `${numbers} ${randomItem(streets)}, ${randomItem(cities)}, TX ${Math.floor(Math.random() * 90000) + 10000}`;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedData() {
  console.log('🌱 Starting Pipedrive Data Seeding...');
  console.log('═══════════════════════════════════════════');

  try {
    // Step 1: Create Organizations
    console.log('📢 Creating Organizations...');
    const createdOrgs = [];
    
    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];
      const orgData = {
        name: org.name,
        address: generateAddress(),
        phone: generatePhone(),
        email: `info@${org.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
        category: org.type
      };

      try {
        const result = await apiRequest('/organizations', 'POST', orgData);
        createdOrgs.push(result.data);
        console.log(`  ✓ ${org.name}`);
      } catch (error) {
        console.log(`  ✗ Failed: ${org.name} - ${error.message}`);
      }
      
      await delay(150); // Rate limiting
    }

    // Step 2: Create Persons
    console.log('\n👥 Creating Persons...');
    const createdPersons = [];
    
    for (let i = 0; i < people.length && i < createdOrgs.length; i++) {
      const person = people[i];
      const org = createdOrgs[i % createdOrgs.length];
      
      const personData = {
        name: `${person.first} ${person.last}`,
        email: `${person.first.toLowerCase()}.${person.last.toLowerCase()}@${org.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
        phone: generatePhone(),
        job_title: person.title,
        org_id: org.id
      };

      try {
        const result = await apiRequest('/persons', 'POST', personData);
        createdPersons.push(result.data);
        console.log(`  ✓ ${personData.name} (${person.title})`);
      } catch (error) {
        console.log(`  ✗ Failed: ${personData.name} - ${error.message}`);
      }
      
      await delay(150);
    }

    // Step 3: Create Deals
    console.log('\n💼 Creating Deals...');
    const createdDeals = [];
    
    for (let i = 0; i < 60; i++) { // Create 60 deals
      const service = randomItem(services);
      const person = randomItem(createdPersons);
      const org = createdOrgs.find(o => o.id === person.org_id) || randomItem(createdOrgs);
      
      // Add variation to price (±30%)
      const variation = (Math.random() * 0.6) - 0.3; // -30% to +30%
      const finalValue = Math.round(service.value * (1 + variation));
      
      const dealData = {
        title: `${service.type} - ${person.name}`,
        value: finalValue,
        currency: 'USD',
        person_id: person.id,
        org_id: org.id,
        stage_id: Math.floor(Math.random() * 5) + 1, // Stages 1-5
        status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'won' : 'lost') : 'open'
      };

      try {
        const result = await apiRequest('/deals', 'POST', dealData);
        createdDeals.push(result.data);
        console.log(`  ✓ ${service.type} - $${finalValue.toLocaleString()}`);
      } catch (error) {
        console.log(`  ✗ Failed: ${service.type} - ${error.message}`);
      }
      
      await delay(200);
    }

    // Step 4: Create Activities
    console.log('\n📅 Creating Activities...');
    const activityTypes = ['call', 'meeting', 'task', 'email'];
    const subjects = {
      call: [
        'Follow up call with customer',
        'Schedule service appointment', 
        'Quote discussion',
        'Customer satisfaction check',
        'Emergency service inquiry'
      ],
      meeting: [
        'On-site consultation',
        'Project planning meeting',
        'Equipment walkthrough',
        'Final inspection',
        'Contract signing appointment'
      ],
      task: [
        'Prepare detailed quote',
        'Order required equipment',
        'Schedule technician visit',
        'Update customer records',
        'Process service payment'
      ],
      email: [
        'Send quote to customer',
        'Appointment confirmation',
        'Service completion summary',
        'Maintenance reminder notice',
        'Invoice delivery'
      ]
    };

    let activitiesCreated = 0;
    for (let i = 0; i < 100; i++) { // Create 100 activities
      const type = randomItem(activityTypes);
      const subjectList = subjects[type];
      const subject = randomItem(subjectList);
      const person = randomItem(createdPersons);
      const deal = randomItem(createdDeals);
      
      // Generate realistic timing
      const isCompleted = Math.random() > 0.4; // 60% completed
      const daysOffset = isCompleted ? 
        -Math.floor(Math.random() * 30) : // Past date for completed
        Math.floor(Math.random() * 45) + 1; // Future date for pending
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysOffset);
      
      const activityData = {
        type: type,
        subject: subject,
        person_id: person.id,
        deal_id: deal.id,
        due_date: dueDate.toISOString().split('T')[0],
        due_time: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'][Math.floor(Math.random() * 6)],
        done: isCompleted
      };

      try {
        await apiRequest('/activities', 'POST', activityData);
        activitiesCreated++;
        console.log(`  ✓ ${subject} (${type})`);
      } catch (error) {
        console.log(`  ✗ Failed: ${subject} - ${error.message}`);
      }
      
      await delay(180);
    }

    // Success Summary
    console.log('\n🎉 DATA SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Summary:`);
    console.log(`   📢 ${createdOrgs.length} Organizations created`);
    console.log(`   👥 ${createdPersons.length} Persons created`);
    console.log(`   💼 ${createdDeals.length} Deals created`);
    console.log(`   📅 ${activitiesCreated} Activities created`);
    
    const totalValue = createdDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    console.log(`   💰 Total Pipeline Value: $${totalValue.toLocaleString()}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Open http://localhost:3000/dashboard');
    console.log('2. Visit Jobs page to see drag-drop pipeline');
    console.log('3. Check Activity Feed on main dashboard');
    console.log('4. Explore Contacts and Reports pages');
    console.log('5. Test real-time sync with Pipedrive');
    console.log('\nYour CRM is now fully populated with realistic data! 🚀');

  } catch (error) {
    console.error('\n❌ Error during data seeding:', error.message);
    console.error('Make sure your Pipedrive API key is valid and has the necessary permissions.');
  }
}

// Execute the seeding
seedData();