/**
 * Create Initial Production User
 * Run manually after first production deployment
 *
 * Usage:
 * INITIAL_USER_PASSWORD="YourSecurePassword" npx tsx scripts/create-initial-user.ts
 */

import { PrismaClient, Role } from '@prisma/client'
import { auth } from '../src/lib/auth'

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
    // Create user with Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: { email, password, name },
    })

    if (signUpResult.user) {
      // Update to SUPER_ADMIN
      await prisma.user.update({
        where: { id: signUpResult.user.id },
        data: {
          emailVerified: true,
          role: Role.SUPER_ADMIN,
        },
      })

      console.log('✅ Initial user created successfully!')
      console.log('\n🔑 Login Credentials:')
      console.log(`   Email: ${email}`)
      console.log(`   Role: SUPER_ADMIN`)
      console.log('\n⚠️  IMPORTANT: Change this password after first login!')
    } else {
      throw new Error('User sign up failed')
    }
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
