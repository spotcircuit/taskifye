#!/usr/bin/env node

// Create more leads (persons without deals) for realistic CRM data
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
  console.log('🎯 CREATING MORE LEADS')
  console.log('=' .repeat(25))

  try {
    // Get existing organizations
    const orgsResp = await makeRequest('/organizations?limit=100')
    const organizations = orgsResp.success ? orgsResp.data : []
    
    if (organizations.length === 0) {
      console.log('❌ No organizations found')
      return
    }

    console.log(`📋 Found ${organizations.length} organizations`)

    // Create more lead prospects (without deals)
    console.log('\n👥 Creating Lead Prospects...')
    
    const leadProspects = [
      { first: 'Karen', last: 'Mitchell', title: 'Property Manager', source: 'Website Inquiry' },
      { first: 'Brian', last: 'Taylor', title: 'Building Owner', source: 'Referral' },
      { first: 'Nicole', last: 'Johnson', title: 'Facilities Manager', source: 'Cold Call' },
      { first: 'Kevin', last: 'Brown', title: 'Operations Director', source: 'Trade Show' },
      { first: 'Rachel', last: 'Davis', title: 'Site Manager', source: 'Google Search' },
      { first: 'Steven', last: 'Wilson', title: 'General Manager', source: 'LinkedIn' },
      { first: 'Heather', last: 'Garcia', title: 'Office Manager', source: 'Yellow Pages' },
      { first: 'Jason', last: 'Martinez', title: 'Maintenance Director', source: 'Referral' },
      { first: 'Lisa', last: 'Anderson', title: 'Property Owner', source: 'Website Inquiry' },
      { first: 'Mark', last: 'Thomas', title: 'Facility Coordinator', source: 'Cold Call' },
      { first: 'Angela', last: 'Jackson', title: 'Regional Manager', source: 'Trade Show' },
      { first: 'Paul', last: 'White', title: 'Building Superintendent', source: 'Google Ads' },
      { first: 'Stephanie', last: 'Harris', title: 'Administrative Manager', source: 'Referral' },
      { first: 'Jonathan', last: 'Clark', title: 'Operations Manager', source: 'Website Form' },
      { first: 'Melissa', last: 'Lewis', title: 'Facilities Director', source: 'Phone Inquiry' },
      { first: 'Ryan', last: 'Walker', title: 'Property Manager', source: 'Email Campaign' },
      { first: 'Jennifer', last: 'Hall', title: 'Site Supervisor', source: 'Direct Mail' },
      { first: 'Todd', last: 'Allen', title: 'Building Manager', source: 'Cold Call' },
      { first: 'Kimberly', last: 'Young', title: 'General Manager', source: 'Trade Show' },
      { first: 'Scott', last: 'King', title: 'Maintenance Manager', source: 'Referral' }
    ]

    function generatePhone() {
      const areaCodes = ['512', '713', '214', '210', '817', '915', '469', '361', '903', '940']
      const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)]
      const exchange = Math.floor(Math.random() * 900) + 100
      const number = Math.floor(Math.random() * 9000) + 1000
      return `(${areaCode}) ${exchange}-${number}`
    }

    // Create new organizations for some leads
    const newOrganizations = [
      { name: 'Riverside Business Center', address: '1111 Commerce Dr, Austin, TX 78703' },
      { name: 'Metro Industrial Park', address: '2222 Factory Rd, Houston, TX 77003' },
      { name: 'Lakeside Office Plaza', address: '3333 Professional Blvd, Dallas, TX 75203' },
      { name: 'Northside Retail Center', address: '4444 Shopping Way, San Antonio, TX 78203' },
      { name: 'Gateway Technology Center', address: '5555 Innovation St, Austin, TX 78704' },
      { name: 'Summit Medical Complex', address: '6666 Health Ave, Fort Worth, TX 76103' }
    ]

    console.log('\n🏢 Creating New Organizations for Leads...')
    const createdNewOrgs = []
    for (const org of newOrganizations) {
      try {
        const response = await makeRequest('/organizations', 'POST', org)
        if (response.success && response.data) {
          createdNewOrgs.push(response.data)
          console.log(`   ✅ ${org.name}`)
        }
      } catch (error) {
        console.log(`   ❌ ${org.name} - ${error.message}`)
      }
      await delay(150)
    }

    // Combine all organizations
    const allOrgs = [...organizations, ...createdNewOrgs]

    // Create lead prospects
    const createdLeads = []
    for (let i = 0; i < leadProspects.length; i++) {
      const lead = leadProspects[i]
      const org = allOrgs[Math.floor(Math.random() * allOrgs.length)]
      
      if (!org) continue

      try {
        const personData = {
          name: `${lead.first} ${lead.last}`,
          email: [`${lead.first.toLowerCase()}.${lead.last.toLowerCase()}@${org.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`],
          phone: [generatePhone()],
          job_title: lead.title,
          org_id: org.id,
          label: lead.source // This will help identify lead source
        }

        const response = await makeRequest('/persons', 'POST', personData)
        if (response.success && response.data) {
          createdLeads.push(response.data)
          console.log(`   ✅ ${lead.first} ${lead.last} - ${org.name} (${lead.source})`)
        }
      } catch (error) {
        console.log(`   ❌ ${lead.first} ${lead.last} - ${error.message}`)
      }
      await delay(150)
    }

    // Create realistic activity history for leads
    console.log('\n📅 Creating Activity History for Leads...')
    const activityScenarios = [
      // Recent past activities (completed)
      {
        type: 'call',
        subjects: ['Initial inquiry call', 'Discussed HVAC needs', 'Price quote discussion', 'Follow up on estimate'],
        completed: true,
        daysAgo: [1, 3, 7, 14]
      },
      {
        type: 'email',
        subjects: ['Sent service brochure', 'Email inquiry response', 'Quote follow-up email', 'Maintenance plan details'],
        completed: true,
        daysAgo: [2, 5, 10, 21]
      },
      {
        type: 'meeting',
        subjects: ['On-site consultation', 'Equipment walkthrough', 'Needs assessment meeting'],
        completed: true,
        daysAgo: [7, 14, 30]
      },
      // Future activities (pending)
      {
        type: 'call',
        subjects: ['Follow up on quote', 'Check decision timeline', 'Schedule installation'],
        completed: false,
        daysAhead: [1, 3, 7, 14]
      },
      {
        type: 'email',
        subjects: ['Send updated proposal', 'Maintenance contract follow-up', 'Energy efficiency report'],
        completed: false,
        daysAhead: [2, 5, 10]
      },
      {
        type: 'meeting',
        subjects: ['Final consultation', 'Contract signing', 'Installation planning'],
        completed: false,
        daysAhead: [3, 7, 14]
      }
    ]

    for (let i = 0; i < createdLeads.length; i++) {
      const lead = createdLeads[i]
      const numActivities = Math.floor(Math.random() * 4) + 2 // 2-5 activities per lead
      
      console.log(`\n   📋 Creating activity history for ${lead.name}:`)
      
      for (let j = 0; j < numActivities; j++) {
        const scenario = activityScenarios[Math.floor(Math.random() * activityScenarios.length)]
        const subject = scenario.subjects[Math.floor(Math.random() * scenario.subjects.length)]
        
        let activityDate = new Date()
        if (scenario.completed) {
          // Past activity
          const daysAgo = scenario.daysAgo[Math.floor(Math.random() * scenario.daysAgo.length)]
          activityDate.setDate(activityDate.getDate() - daysAgo)
        } else {
          // Future activity
          const daysAhead = scenario.daysAhead[Math.floor(Math.random() * scenario.daysAhead.length)]
          activityDate.setDate(activityDate.getDate() + daysAhead)
        }
        
        try {
          const activityData = {
            type: scenario.type,
            subject: subject,
            person_id: lead.id,
            due_date: activityDate.toISOString().split('T')[0],
            due_time: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'][Math.floor(Math.random() * 6)],
            done: scenario.completed ? 1 : 0,
            note: scenario.completed ? 
              `Lead source: ${lead.label || 'Unknown'}. ${scenario.type === 'call' ? 'Spoke with customer about HVAC needs.' : scenario.type === 'email' ? 'Sent detailed information via email.' : 'Met with customer on-site.'}` :
              `Scheduled follow-up for lead from ${lead.label || 'Unknown'}.`
          }

          const response = await makeRequest('/activities', 'POST', activityData)
          if (response.success) {
            const status = scenario.completed ? '✅ Completed' : '📅 Scheduled'
            const when = scenario.completed ? `${scenario.daysAgo[0]} days ago` : `in ${scenario.daysAhead[0]} days`
            console.log(`     ${status}: ${subject} (${scenario.type}) - ${when}`)
          }
        } catch (error) {
          console.log(`     ❌ Activity error: ${subject}`)
        }
        await delay(100)
      }
      
      await delay(200)
    }

    // Add notes to some leads with correspondence details
    console.log('\n📝 Adding Correspondence Notes...')
    for (let i = 0; i < Math.min(8, createdLeads.length); i++) {
      const lead = createdLeads[i]
      const noteTemplates = [
        `Initial contact via ${lead.label || 'phone'}. Customer interested in HVAC maintenance contract for ${lead.job_title} role.`,
        `Discussed current HVAC issues during phone call. Customer mentioned high energy bills and uneven temperatures.`,
        `Email inquiry about commercial HVAC services. Requested quote for ${Math.floor(Math.random() * 50 + 10)} unit building.`,
        `Referral from existing customer. Needs emergency AC repair estimate. Very interested in maintenance plan.`,
        `Trade show lead - collected business card. Follow up needed for facilities assessment.`,
        `Website form submission requesting quote. Customer indicated budget of $${Math.floor(Math.random() * 50 + 10)}K for HVAC upgrade.`
      ]
      
      const note = noteTemplates[Math.floor(Math.random() * noteTemplates.length)]
      
      try {
        const noteData = {
          content: note,
          person_id: lead.id,
          add_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random time in last week
        }

        const response = await makeRequest('/notes', 'POST', noteData)
        if (response.success) {
          console.log(`   ✅ Note added for ${lead.name}`)
        }
      } catch (error) {
        console.log(`   ❌ Note error for ${lead.name}`)
      }
      await delay(100)
    }

    console.log('\n🎉 SUCCESS!')
    console.log('=' .repeat(20))
    console.log(`✅ Created ${createdNewOrgs.length} New Organizations`)
    console.log(`✅ Created ${createdLeads.length} Lead Prospects`)
    console.log('✅ Added follow-up activities for hot leads')

    console.log('\n📊 Expected Results:')
    console.log(`- Total Contacts: ~${15 + createdLeads.length}`)
    console.log(`- Customers: ~14 (have deals)`)
    console.log(`- Leads: ~${1 + createdLeads.length} (no deals yet)`)

    console.log('\n🎯 Lead Sources Include:')
    console.log('- Website Inquiries')
    console.log('- Referrals')
    console.log('- Cold Calls')
    console.log('- Trade Shows')
    console.log('- Google Search/Ads')
    console.log('- LinkedIn')

    console.log('\n📱 Check your app:')
    console.log('- Contacts: http://localhost:3000/dashboard/contacts')
    console.log('- Should now see many more leads!')

  } catch (error) {
    console.error('❌ Script failed:', error.message)
  }
}

main()