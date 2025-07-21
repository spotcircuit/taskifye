import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Encryption helpers (same as in API route)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!'
const IV_LENGTH = 16

function encrypt(text: string): string {
  if (!text) return ''
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  )
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Agency
  const agency = await prisma.agency.upsert({
    where: { slug: 'spotcircuit-agency' },
    update: {},
    create: {
      name: 'SpotCircuit Agency',
      slug: 'spotcircuit-agency',
      email: 'brian@spotcircuit.com',
      phone: '1-800-SPOT-FIX',
      isActive: true
    }
  })
  console.log('✅ Agency created:', agency.name)

  // Create Brian's user account (without auth for now)
  const hashedPassword = await bcrypt.hash('1234', 10)
  const brian = await prisma.user.upsert({
    where: { email: 'brian@spotcircuit.com' },
    update: {},
    create: {
      email: 'brian@spotcircuit.com',
      name: 'Brian',
      password: hashedPassword,
      role: 'agency_admin',
      agencyId: agency.id
    }
  })
  console.log('✅ User created:', brian.email)

  // Create Client 1: Premium Painting Co
  const client1 = await prisma.client.upsert({
    where: { slug: 'premium-painting' },
    update: {},
    create: {
      agencyId: agency.id,
      name: 'Premium Painting Co',
      slug: 'premium-painting',
      businessType: 'painting',
      email: 'info@premiumpainting.com',
      phone: '(555) 123-4567',
      website: 'https://premiumpainting.com',
      isActive: true,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        businessHours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '18:00' },
          saturday: { open: '09:00', close: '14:00' },
          sunday: { closed: true }
        }
      }
    }
  })
  console.log('✅ Client 1 created:', client1.name)

  // Create or update Branding for Client 1
  await prisma.branding.upsert({
    where: { clientId: client1.id },
    update: {
      primaryColor: '#7c3aed', // Purple
      secondaryColor: '#10b981', // Green
      accentColor: '#f59e0b', // Amber
      companyName: 'Premium Painting Co',
      tagline: 'Transforming Spaces with Color',
      supportEmail: 'support@premiumpainting.com',
      supportPhone: '(555) 123-4567'
    },
    create: {
      clientId: client1.id,
      primaryColor: '#7c3aed', // Purple
      secondaryColor: '#10b981', // Green
      accentColor: '#f59e0b', // Amber
      companyName: 'Premium Painting Co',
      tagline: 'Transforming Spaces with Color',
      supportEmail: 'support@premiumpainting.com',
      supportPhone: '(555) 123-4567'
    }
  })

  // Create or update API Settings for Client 1 with Pipedrive and ReachInbox API keys
  await prisma.apiSettings.upsert({
    where: { clientId: client1.id },
    update: {
      pipedriveApiKey: encrypt('2911f330137024c4d04b3e0256f67d7a83102f1a'),
      pipedriveCompanyDomain: 'premium-painting',
      reachInboxApiKey: encrypt('ec7f57a3-e34d-425d-b838-f9b0a1a1a6ae')
    },
    create: {
      clientId: client1.id,
      pipedriveApiKey: encrypt('2911f330137024c4d04b3e0256f67d7a83102f1a'),
      pipedriveCompanyDomain: 'premium-painting',
      reachInboxApiKey: encrypt('ec7f57a3-e34d-425d-b838-f9b0a1a1a6ae')
    }
  })

  // Create Client 2: Swift Plumbing Solutions
  const client2 = await prisma.client.upsert({
    where: { slug: 'swift-plumbing' },
    update: {},
    create: {
      agencyId: agency.id,
      name: 'Swift Plumbing Solutions',
      slug: 'swift-plumbing',
      businessType: 'plumbing',
      email: 'hello@swiftplumbing.com',
      phone: '(555) 987-6543',
      website: 'https://swiftplumbing.com',
      isActive: true,
      settings: {
        timezone: 'America/Chicago',
        currency: 'USD',
        businessHours: {
          monday: { open: '07:00', close: '19:00' },
          tuesday: { open: '07:00', close: '19:00' },
          wednesday: { open: '07:00', close: '19:00' },
          thursday: { open: '07:00', close: '19:00' },
          friday: { open: '07:00', close: '19:00' },
          saturday: { open: '08:00', close: '17:00' },
          sunday: { open: '10:00', close: '16:00' }
        }
      }
    }
  })
  console.log('✅ Client 2 created:', client2.name)

  // Create or update Branding for Client 2
  await prisma.branding.upsert({
    where: { clientId: client2.id },
    update: {
      primaryColor: '#059669', // Green
      secondaryColor: '#3b82f6', // Blue
      accentColor: '#8b5cf6', // Purple
      companyName: 'Swift Plumbing Solutions',
      tagline: 'Fast, Reliable, Professional',
      supportEmail: 'help@swiftplumbing.com',
      supportPhone: '(555) 987-6543'
    },
    create: {
      clientId: client2.id,
      primaryColor: '#059669', // Green
      secondaryColor: '#3b82f6', // Blue
      accentColor: '#8b5cf6', // Purple
      companyName: 'Swift Plumbing Solutions',
      tagline: 'Fast, Reliable, Professional',
      supportEmail: 'help@swiftplumbing.com',
      supportPhone: '(555) 987-6543'
    }
  })

  // Create or update API Settings for Client 2 (empty for now)
  await prisma.apiSettings.upsert({
    where: { clientId: client2.id },
    update: {},
    create: {
      clientId: client2.id
    }
  })

  // Give Brian access to both clients
  await prisma.clientUser.upsert({
    where: {
      userId_clientId: {
        userId: brian.id,
        clientId: client1.id
      }
    },
    update: { role: 'admin' },
    create: {
      userId: brian.id,
      clientId: client1.id,
      role: 'admin'
    }
  })

  await prisma.clientUser.upsert({
    where: {
      userId_clientId: {
        userId: brian.id,
        clientId: client2.id
      }
    },
    update: { role: 'admin' },
    create: {
      userId: brian.id,
      clientId: client2.id,
      role: 'admin'
    }
  })

  console.log('✅ User access granted to both clients')

  // Delete existing jobs for client 1 and create new ones
  await prisma.job.deleteMany({ where: { clientId: client1.id } })
  await prisma.job.createMany({
    data: [
      {
        jobNumber: 'PAINT-2024-001',
        clientId: client1.id,
        status: 'SCHEDULED',
        serviceType: 'Interior Painting',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        customerPhone: '(555) 111-2222',
        customerAddress: '123 Main St, New York, NY',
        scheduledDate: new Date('2024-12-20'),
        quotedAmount: 2500.00
      },
      {
        jobNumber: 'PAINT-2024-002',
        clientId: client1.id,
        status: 'IN_PROGRESS',
        serviceType: 'Exterior Painting',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        customerPhone: '(555) 333-4444',
        customerAddress: '456 Oak Ave, New York, NY',
        scheduledDate: new Date('2024-12-18'),
        quotedAmount: 4500.00
      }
    ]
  })

  // Delete existing jobs for client 2 and create new ones
  await prisma.job.deleteMany({ where: { clientId: client2.id } })
  await prisma.job.createMany({
    data: [
      {
        jobNumber: 'PLB-2024-101',
        clientId: client2.id,
        status: 'COMPLETED',
        serviceType: 'Pipe Leak Repair',
        customerName: 'Mike Wilson',
        customerEmail: 'mike@example.com',
        customerPhone: '(555) 555-6666',
        customerAddress: '789 Elm St, Chicago, IL',
        scheduledDate: new Date('2024-12-15'),
        quotedAmount: 425.00,
        finalAmount: 425.00,
        completedAt: new Date('2024-12-15'),
        paymentStatus: 'PAID'
      },
      {
        jobNumber: 'PLB-2024-102',
        clientId: client2.id,
        status: 'QUOTED',
        serviceType: 'Bathroom Remodel',
        customerName: 'Lisa Davis',
        customerEmail: 'lisa@example.com',
        customerPhone: '(555) 777-8888',
        customerAddress: '321 Pine Rd, Chicago, IL',
        quotedAmount: 8500.00
      }
    ]
  })

  console.log('✅ Sample jobs created for both clients')

  console.log(`
🎉 Seed completed successfully!

Agency: SpotCircuit Agency
User: brian@spotcircuit.com (password: 1234)

Clients:
1. Premium Painting Co (Purple theme) - WITH API KEYS
   - 2 jobs (1 scheduled, 1 in progress)
   - Pipedrive & ReachInbox API keys configured
   
2. Swift Plumbing Solutions (Green theme) - NO API KEYS
   - 2 jobs (1 completed, 1 quoted)
   - No integrations configured

You can now log in and switch between clients!
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })