/**
 * Create Initial Production User
 * Run manually after first production deployment
 *
 * Usage:
 * INITIAL_USER_PASSWORD="YourSecurePassword" npx tsx scripts/create-initial-user.ts
 */

import { PrismaClient } from '@prisma/client'
import { hash } from '@node-rs/argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creating initial production user...')

  // Check if any users exist
  const existingUsers = await prisma.user.count()

  if (existingUsers > 0) {
    console.log('⚠️  Users already exist. Skipping user creation.')
    console.log(`   Found ${existingUsers} user(s) in database.`)
    process.exit(0)
  }

  // Get SUPER_ADMIN role
  const superAdminRole = await prisma.customRole.findUnique({
    where: { key: 'SUPER_ADMIN' }
  })

  if (!superAdminRole) {
    console.error('❌ Error: SUPER_ADMIN role not found')
    console.error('   Run seed scripts first: npx tsx prisma/seed-system-roles.ts')
    process.exit(1)
  }

  // Fixed credentials
  const email = 'jairo@mantenix.com'
  const name = 'Jairo'
  const password = process.env.INITIAL_USER_PASSWORD

  if (!password) {
    console.error('❌ Error: INITIAL_USER_PASSWORD environment variable is required')
    console.error('   Set it before running this script:')
    console.error('   export INITIAL_USER_PASSWORD="your-secure-password"')
    console.error('   Or: INITIAL_USER_PASSWORD="your-password" npx tsx scripts/create-initial-user.ts')
    process.exit(1)
  }

  console.log(`📧 Email: ${email}`)
  console.log(`👤 Name: ${name}`)
  console.log(`🔑 Password: ${'*'.repeat(password.length)} characters`)

  try {
    // Hash password using Better Auth's default hasher (argon2)
    const hashedPassword = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    })

    // Create user directly with Prisma
    const user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true,
        roleId: superAdminRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Create account with password hash
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      }
    })

    console.log('✅ Initial user created successfully!')
    console.log('\n🔑 Login Credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Role: SUPER_ADMIN`)
    console.log('\n⚠️  IMPORTANT: Change this password after first login!')
  } catch (error) {
    console.error('❌ Error creating user:', error)
    process.exit(1)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Script failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
