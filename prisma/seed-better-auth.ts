/**
 * Better Auth Compatible Seed
 * Uses Better Auth API with roleId from database
 *
 * IMPORTANTE: Debe ejecutarse DESPUÉS de seed-system-roles.ts
 */

import { PrismaClient } from '@prisma/client'
import { auth } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Buscar el rol SUPER_ADMIN del sistema
  const superAdminRole = await prisma.customRole.findUnique({
    where: { key: 'SUPER_ADMIN' }
  })

  if (!superAdminRole) {
    throw new Error('❌ Rol SUPER_ADMIN no encontrado. Ejecuta primero: npx tsx prisma/seed-system-roles.ts')
  }

  console.log(`✓ Rol SUPER_ADMIN encontrado: ${superAdminRole.id}`)

  // Reset users and companies to avoid conflicts
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  console.log('👤 Creating SUPER_ADMIN user...')

  // Single user data
  const email = 'jairo@mantenix.com'
  const name = 'Jairo'
  const password = 'Mantenix123!@#'

  // Use Better Auth API to create user (it handles password hashing correctly)
  const signUpResult = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      roleId: superAdminRole.id, // Pass roleId as additional field
    }
  })

  if (!signUpResult || !signUpResult.user) {
    throw new Error('Failed to create user via Better Auth')
  }

  // Update user to mark email as verified
  await prisma.user.update({
    where: { id: signUpResult.user.id },
    data: {
      emailVerified: true,
    }
  })

  console.log('✅ User created successfully')

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