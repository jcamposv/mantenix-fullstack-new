/**
 * Create test user for authentication testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestUser() {
  console.log('🧪 Creating test user...')

  // Get ADMIN_EMPRESA role
  const adminEmpresaRole = await prisma.customRole.findUnique({
    where: { key: 'ADMIN_EMPRESA' }
  })

  if (!adminEmpresaRole) {
    console.error('❌ Error: ADMIN_EMPRESA role not found')
    console.error('   Run seed scripts first: npx tsx prisma/seed-system-roles.ts')
    process.exit(1)
  }

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

  // Create user with all profile data included
  const user = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      name: 'John Doe',
      emailVerified: true,
      companyId: company.id,
      roleId: adminEmpresaRole.id,
      timezone: 'America/New_York',
      locale: 'en',
      preferences: JSON.stringify({
        theme: 'light',
        notifications: { email: true, browser: true },
      }),
      // We'll let Better Auth handle the password during actual signup
    },
  })

  console.log('✅ Test user structure created')
  console.log('🔑 Now you need to sign up via the UI with:')
  console.log('   Email: admin@acme.com')
  console.log('   Password: AdminEmpresa123!@#')

  await prisma.$disconnect()
}

createTestUser().catch(console.error)