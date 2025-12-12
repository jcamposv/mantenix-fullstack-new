/**
 * Script to check time logs for a work order
 */

import { prisma } from "../src/lib/prisma"

async function checkTimeLogs(workOrderId: string) {
  console.log(`\n🔍 Verificando logs de tiempo para: ${workOrderId}\n`)

  const logs = await prisma.workOrderTimeLog.findMany({
    where: { workOrderId },
    orderBy: { timestamp: 'asc' },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  if (logs.length === 0) {
    console.log("❌ No se encontraron logs de tiempo")
    return
  }

  console.log(`📋 Logs encontrados: ${logs.length}\n`)

  logs.forEach((log, index) => {
    const timestamp = new Date(log.timestamp)
    console.log(`${index + 1}. ${log.action}`)
    console.log(`   Usuario: ${log.user.name}`)
    console.log(`   Fecha: ${timestamp.toLocaleString('es-ES')}`)
    console.log(`   Timestamp: ${log.timestamp}`)
    if (log.segmentDurationMinutes) {
      console.log(`   Duración del segmento: ${log.segmentDurationMinutes} minutos`)
    }
    if (log.notes) {
      console.log(`   Notas: ${log.notes}`)
    }
    console.log()
  })

  // Calculate time differences
  console.log("⏱️  Diferencias de tiempo entre logs:\n")
  for (let i = 1; i < logs.length; i++) {
    const prev = new Date(logs[i - 1].timestamp)
    const current = new Date(logs[i].timestamp)
    const diffMs = current.getTime() - prev.getTime()
    const diffMinutes = diffMs / 1000 / 60
    const diffSeconds = diffMs / 1000

    console.log(`${logs[i - 1].action} → ${logs[i].action}`)
    console.log(`   ${diffMinutes.toFixed(2)} minutos (${diffSeconds.toFixed(2)} segundos)`)
    console.log()
  }

  // Get work order times
  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    select: {
      number: true,
      activeWorkTime: true,
      waitingTime: true,
      actualDuration: true,
    },
  })

  if (workOrder) {
    console.log("📊 Tiempos registrados en la orden:\n")
    console.log(`   Orden: ${workOrder.number}`)
    console.log(`   Tiempo activo: ${workOrder.activeWorkTime} minutos`)
    console.log(`   Tiempo de espera: ${workOrder.waitingTime} minutos`)
    console.log(`   Duración total: ${workOrder.actualDuration} minutos`)
  }
}

const workOrderId = process.argv[2]

if (!workOrderId) {
  console.error("❌ Uso: npx tsx scripts/check-time-logs.ts <workOrderId>")
  process.exit(1)
}

checkTimeLogs(workOrderId)
  .then(() => {
    console.log("\n✨ Consulta completada\n")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Error:", error)
    process.exit(1)
  })
