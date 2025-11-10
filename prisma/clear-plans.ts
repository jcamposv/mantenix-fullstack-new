import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up existing plans...')

  await prisma.planFeature.deleteMany({})
  console.log('✅ Deleted all plan features')

  await prisma.subscriptionPlan.deleteMany({})
  console.log('✅ Deleted all subscription plans')

  console.log('🎉 Cleanup complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
