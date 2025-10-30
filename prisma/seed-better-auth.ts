/**
 * Better Auth Compatible Seed
 * Creates users using Better Auth's internal methods
 */

import { PrismaClient, Role } from '@prisma/client'
import { auth } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Better Auth minimal seed...')

  // Reset users and companies to avoid conflicts
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  console.log('👤 Creating single user with Better Auth...')

  // Single user data
  const email = 'jairo@mantenix.com'
  const name = 'Jairo'
  const password = 'Mantenix123!@#'

  const signUpResult = await auth.api.signUpEmail({
    body: { email, password, name },
  })

  if (signUpResult.user) {
    await prisma.user.update({
      where: { id: signUpResult.user.id },
      data: {
        emailVerified: true,
        role: Role.SUPER_ADMIN,
      },
    })

    console.log('✅ User created and updated successfully')
  } else {
    throw new Error('User sign up failed')
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n🔑 Login Credentials:')
  console.log('   SUPER_ADMIN: jairo@mantenix.com / Mantenix123!@#')
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