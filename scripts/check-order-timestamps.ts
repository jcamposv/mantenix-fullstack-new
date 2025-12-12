import { prisma } from '../src/lib/prisma'

async function checkOrderTimestamps(workOrderId: string) {
  const order = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    select: {
      id: true,
      number: true,
      status: true,
      startedAt: true,
      completedAt: true,
      activeWorkTime: true,
      waitingTime: true,
      actualDuration: true
    }
  })

  if (!order) {
    console.log('Order not found')
    return
  }

  console.log('Order:', order.number)
  console.log('Status:', order.status)
  console.log('Started:', order.startedAt?.toLocaleString('es-ES'))
  console.log('Completed:', order.completedAt?.toLocaleString('es-ES'))
  console.log('Active Work Time:', order.activeWorkTime, 'minutes')
  console.log('Waiting Time:', order.waitingTime, 'minutes')
  console.log('Actual Duration:', order.actualDuration, 'minutes')

  if (order.startedAt && order.completedAt) {
    const durationMs = order.completedAt.getTime() - order.startedAt.getTime()
    const calculatedDuration = durationMs / 60000
    console.log('\nCalculated duration (from timestamps):', calculatedDuration.toFixed(2), 'minutes')
  }
}

const workOrderId = process.argv[2]
if (!workOrderId) {
  console.error('Usage: npx tsx scripts/check-order-timestamps.ts <workOrderId>')
  process.exit(1)
}

checkOrderTimestamps(workOrderId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
