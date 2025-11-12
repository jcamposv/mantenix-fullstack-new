import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkWorkOrders() {
  try {
    // Get company by subdomain
    const company = await prisma.company.findFirst({
      where: { subdomain: 'codela' }
    })

    if (!company) {
      console.log('❌ Company with subdomain "codela" not found')
      return
    }

    console.log(`✅ Company found: ${company.name} (ID: ${company.id})`)

    // Get work orders
    const workOrders = await prisma.workOrder.findMany({
      where: { companyId: company.id },
      select: {
        number: true,
        status: true,
        actualCost: true,
        laborCost: true,
        partsCost: true,
        estimatedCost: true,
        completedAt: true,
        startedAt: true,
        activeWorkTime: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`\n📊 Found ${workOrders.length} work orders:\n`)

    if (workOrders.length === 0) {
      console.log('❌ No work orders found. Create one to populate Analytics dashboard.')
      console.log('\nSteps to populate dashboard:')
      console.log('1. Create a work order with estimatedCost')
      console.log('2. Assign it to a technician with hourlyRate configured')
      console.log('3. START → work on it → COMPLETE')
      console.log('4. System will auto-calculate costs')
      console.log('5. Analytics dashboard will show data')
    } else {
      workOrders.forEach(wo => {
        console.log(`\n${wo.number} - ${wo.status}`)
        console.log(`  Estimated: ₡${wo.estimatedCost || 0}`)
        console.log(`  Labor: ₡${wo.laborCost || 0}`)
        console.log(`  Parts: ₡${wo.partsCost || 0}`)
        console.log(`  Actual Total: ₡${wo.actualCost || 0}`)
        console.log(`  Active Work Time: ${wo.activeWorkTime || 0} minutes`)
        console.log(`  Started: ${wo.startedAt || 'Not started'}`)
        console.log(`  Completed: ${wo.completedAt || 'Not completed'}`)
      })

      const completedWithCosts = workOrders.filter(wo =>
        wo.status === 'COMPLETED' && wo.actualCost !== null
      )

      console.log(`\n\n✅ Completed with costs: ${completedWithCosts.length}`)
      console.log(`❌ Without costs: ${workOrders.length - completedWithCosts.length}`)

      if (completedWithCosts.length === 0) {
        console.log('\n⚠️  No completed work orders with costs found.')
        console.log('This is why Analytics shows ₡0.')
        console.log('Complete at least one work order to see data in Analytics.')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkWorkOrders()
