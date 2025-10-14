/**
 * Create test user for authentication testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestUser() {
  console.log('🧪 Creating test user...')

  // First, ensure we have a company
  const company = await prisma.company.upsert({
    where: { subdomain: 'acme' },
    update: {},
    create: {
      name: 'ACME Corporation',
      subdomain: 'acme',
      primaryColor: '#e74c3c',
      secondaryColor: '#c0392b',
      backgroundColor: '#ffffff',
      tier: 'ENTERPRISE',
      mfaEnforced: true,
      isActive: true,
    },
  })

  // Create user with plain text password - Better Auth will hash it during signup
  const user = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      name: 'John Doe',
      emailVerified: new Date(),
      // We'll let Better Auth handle the password during actual signup
    },
  })

  // Create user profile
  await prisma.userProfile.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      companyId: company.id,
      role: 'ADMIN_EMPRESA',
      timezone: 'America/New_York',
      locale: 'en',
      preferences: {
        theme: 'light',
        notifications: { email: true, browser: true },
      },
      mfaEnabled: false,
    },
  })

  console.log('✅ Test user structure created')
  console.log('🔑 Now you need to sign up via the UI with:')
  console.log('   Email: admin@acme.com')
  console.log('   Password: AdminEmpresa123!@#')
  
  await prisma.$disconnect()
}

createTestUser().catch(console.error)