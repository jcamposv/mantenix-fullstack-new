/**
 * Better Auth Compatible Seed
 * Creates users using Better Auth's internal methods
 */

import { PrismaClient, Role } from '@prisma/client'
import { auth } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Better Auth compatible seed...')

  // First, let's reset users to avoid conflicts
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  // ============================================================================
  // STEP 1: CREATE DEMO COMPANIES
  // ============================================================================
  
  console.log('📊 Creating demo companies...')
  
  const companies = await Promise.all([
    // ACME Corporation - Enterprise tier with MFA enforced
    prisma.company.upsert({
      where: { subdomain: 'acme' },
      update: {},
      create: {
        name: 'ACME Corporation',
        subdomain: 'acme',
        logo: 'https://cdn.mantenix.ai/acme/logo.png',
        logoSmall: 'https://cdn.mantenix.ai/acme/logo-small.png',
        primaryColor: '#e74c3c',
        secondaryColor: '#c0392b',
        backgroundColor: '#ffffff',
        customFont: 'Inter',
        tier: 'ENTERPRISE',
        mfaEnforced: true,
        ipWhitelist: [],
        isActive: true,
      },
    }),

    // TechServices Inc - Professional tier
    prisma.company.upsert({
      where: { subdomain: 'techservices' },
      update: {},
      create: {
        name: 'TechServices Inc',
        subdomain: 'techservices',
        logo: 'https://cdn.mantenix.ai/techservices/logo.png',
        logoSmall: 'https://cdn.mantenix.ai/techservices/logo-small.png',
        primaryColor: '#3498db',
        secondaryColor: '#2980b9',
        backgroundColor: '#f8f9fa',
        customFont: 'Roboto',
        tier: 'PROFESSIONAL',
        mfaEnforced: false,
        ipWhitelist: [],
        isActive: true,
      },
    }),

    // StartupCo - Starter tier
    prisma.company.upsert({
      where: { subdomain: 'startup' },
      update: {},
      create: {
        name: 'StartupCo',
        subdomain: 'startup',
        logo: 'https://cdn.mantenix.ai/startup/logo.png',
        logoSmall: 'https://cdn.mantenix.ai/startup/logo-small.png',
        primaryColor: '#9b59b6',
        secondaryColor: '#8e44ad',
        backgroundColor: '#ffffff',
        tier: 'STARTER',
        mfaEnforced: false,
        ipWhitelist: [],
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${companies.length} companies`)

  // ============================================================================
  // STEP 2: CREATE USERS USING BETTER AUTH
  // ============================================================================

  console.log('👥 Creating users with Better Auth...')

  // Use Better Auth's internal API for proper user creation with password hashing
  const users = [
    {
      email: 'admin@mantenix.ai',
      name: 'Super Administrator',
      password: 'SuperAdmin123!@#',
      role: Role.SUPER_ADMIN,
      companyId: companies[0].id,
    },
    {
      email: 'admin@acme.com',
      name: 'John Doe',
      password: 'AdminEmpresa123!@#',
      role: Role.ADMIN_EMPRESA,
      companyId: companies[0].id,
    },
    {
      email: 'supervisor@acme.com',
      name: 'Jane Smith',
      password: 'Supervisor123!@#',
      role: Role.SUPERVISOR,
      companyId: companies[0].id,
    },
    {
      email: 'tech@acme.com',
      name: 'Mike Johnson',
      password: 'Tecnico123!@#',
      role: Role.TECNICO,
      companyId: companies[0].id,
    },
    {
      email: 'client@acme.com',
      name: 'Sarah Wilson',
      password: 'Cliente123!@#',
      role: Role.CLIENTE_ADMIN_SEDE,
      companyId: companies[0].id,
    },
    {
      email: 'admin@techservices.com',
      name: 'Carlos Rodriguez',
      password: 'AdminEmpresa123!@#',
      role: Role.ADMIN_EMPRESA,
      companyId: companies[1].id,
    },
    {
      email: 'tech@techservices.com',
      name: 'Ana Garcia',
      password: 'Tecnico123!@#',
      role: Role.TECNICO,
      companyId: companies[1].id,
    },
  ]

  const createdUsers = []
  
  for (const userData of users) {
    // Use Better Auth's signUp method to create users with proper password hashing
    const result = await auth.api.signUpEmail({
      body: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
      },
    })

    if (result.user) {
      // Update the user with additional fields after creation
      const updatedUser = await prisma.user.update({
        where: { id: result.user.id },
        data: {
          emailVerified: true,
          role: userData.role,
          companyId: userData.companyId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      
      createdUsers.push({
        ...updatedUser,
        role: userData.role,
        companyId: userData.companyId,
      })
    }
  }

  console.log(`✅ Created ${createdUsers.length} users`)

  console.log('✅ Users created with proper Better Auth password hashing')

  console.log('\n🎉 Better Auth compatible seed completed successfully!')
  console.log('\n🔑 Login Credentials:')
  console.log('   Super Admin: admin@mantenix.ai / SuperAdmin123!@#')
  console.log('   ACME Corporation (acme.localhost:3000):')
  console.log('     Admin: admin@acme.com / AdminEmpresa123!@#')
  console.log('     Supervisor: supervisor@acme.com / Supervisor123!@#')
  console.log('     Technician: tech@acme.com / Tecnico123!@#')
  console.log('     Client: client@acme.com / Cliente123!@#')
  console.log('   TechServices Inc (techservices.localhost:3000):')
  console.log('     Admin: admin@techservices.com / AdminEmpresa123!@#')
  console.log('     Technician: tech@techservices.com / Tecnico123!@#')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })