/**
 * Master Seed File
 * Orchestrates all seed scripts in the correct order
 *
 * Order:
 * 1. Permissions (base permissions)
 * 2. System Roles (references permissions)
 * 3. Subscription Plans (independent)
 * 4. Better Auth User (references roles)
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface SeedStep {
  name: string
  script: string
  required: boolean
}

const SEED_STEPS: SeedStep[] = [
  {
    name: 'Permissions',
    script: 'prisma/seed-permissions.ts',
    required: true
  },
  {
    name: 'System Roles',
    script: 'prisma/seed-system-roles.ts',
    required: true
  },
  {
    name: 'Subscription Plans',
    script: 'prisma/seed-subscription-plans.ts',
    required: true
  },
  {
    name: 'Better Auth User',
    script: 'prisma/seed-better-auth.ts',
    required: true
  }
]

async function runSeed(step: SeedStep): Promise<void> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🌱 Running: ${step.name}`)
  console.log(`${'='.repeat(60)}`)

  try {
    const { stdout, stderr } = await execAsync(`npx tsx ${step.script}`)

    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)

    console.log(`✅ ${step.name} completed successfully`)
  } catch (error) {
    console.error(`❌ ${step.name} failed:`, error)

    if (step.required) {
      throw new Error(`Required seed step "${step.name}" failed`)
    }
  }
}

async function main() {
  console.log('🚀 Starting database seeding...\n')

  const startTime = Date.now()

  for (const step of SEED_STEPS) {
    await runSeed(step)
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎉 All seeds completed successfully in ${duration}s`)
  console.log(`${'='.repeat(60)}`)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  })
