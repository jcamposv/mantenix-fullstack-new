/**
 * Seed script for subscription plans (LATAM pricing)
 * Run with: npx tsx prisma/seed-subscription-plans.ts
 */

import { PrismaClient, PlanTier, FeatureModule } from '@prisma/client'

const prisma = new PrismaClient()

// Features por plan según el mapeo definido
const PLAN_FEATURES = {
  STARTER: [
    FeatureModule.ADVANCED_ANALYTICS,
    FeatureModule.HR_ATTENDANCE,
    FeatureModule.HR_TIME_OFF,
  ],
  BUSINESS: [
    FeatureModule.ADVANCED_ANALYTICS,
    FeatureModule.HR_ATTENDANCE,
    FeatureModule.HR_TIME_OFF,
    FeatureModule.API_ACCESS,
    FeatureModule.INTERNAL_CORPORATE_GROUP,
  ],
  CORPORATE: [
    FeatureModule.ADVANCED_ANALYTICS,
    FeatureModule.HR_ATTENDANCE,
    FeatureModule.HR_TIME_OFF,
    FeatureModule.API_ACCESS,
    FeatureModule.INTERNAL_CORPORATE_GROUP,
    FeatureModule.PRIORITY_SUPPORT,
  ],
  ENTERPRISE: [
    FeatureModule.ADVANCED_ANALYTICS,
    FeatureModule.HR_ATTENDANCE,
    FeatureModule.HR_TIME_OFF,
    FeatureModule.API_ACCESS,
    FeatureModule.INTERNAL_CORPORATE_GROUP,
    FeatureModule.PRIORITY_SUPPORT,
    FeatureModule.DEDICATED_SUPPORT,
    FeatureModule.EXTERNAL_CLIENT_MANAGEMENT,
  ],
}

async function main() {
  console.log('🌱 Seeding subscription plans (LATAM pricing)...')

  // Starter Plan - $199/mes
  const starter = await prisma.subscriptionPlan.upsert({
    where: { name: 'Plan Starter' },
    update: {},
    create: {
      name: 'Plan Starter',
      tier: PlanTier.STARTER,
      description: 'Perfecto para pequeñas empresas que están empezando con mantenimiento digital',
      monthlyPrice: 199,
      annualPrice: 1990, // ~16% descuento anual

      // Limits
      maxUsers: 10,
      maxCompanies: 1,
      maxWarehouses: 3,
      maxWorkOrdersPerMonth: 200,
      maxInventoryItems: 500,
      maxStorageGB: 20,

      // Overage pricing
      overageUserPrice: 15,
      overageStoragePrice: 0.50,
      overageWorkOrderPrice: 1,

      isActive: true,

      // Features incluidos
      features: {
        create: PLAN_FEATURES.STARTER.map(module => ({ module }))
      }
    },
  })

  console.log('✅ Created Starter plan:', starter.name, `- $${starter.monthlyPrice}/mes`)
  console.log('   Features:', PLAN_FEATURES.STARTER.join(', '))

  // Business Plan - $449/mes
  const business = await prisma.subscriptionPlan.upsert({
    where: { name: 'Plan Business' },
    update: {},
    create: {
      name: 'Plan Business',
      tier: PlanTier.BUSINESS,
      description: 'Para empresas en crecimiento que necesitan gestión multi-compañía',
      monthlyPrice: 449,
      annualPrice: 4490, // ~16% descuento anual

      // Limits
      maxUsers: 25,
      maxCompanies: 3,
      maxWarehouses: 10,
      maxWorkOrdersPerMonth: 600,
      maxInventoryItems: 2000,
      maxStorageGB: 100,

      // Overage pricing
      overageUserPrice: 15,
      overageStoragePrice: 0.50,
      overageWorkOrderPrice: 1,

      isActive: true,

      // Features incluidos
      features: {
        create: PLAN_FEATURES.BUSINESS.map(module => ({ module }))
      }
    },
  })

  console.log('✅ Created Business plan:', business.name, `- $${business.monthlyPrice}/mes`)
  console.log('   Features:', PLAN_FEATURES.BUSINESS.join(', '))

  // Corporate Plan - $799/mes
  const corporate = await prisma.subscriptionPlan.upsert({
    where: { name: 'Plan Corporate' },
    update: {},
    create: {
      name: 'Plan Corporate',
      tier: PlanTier.CORPORATE,
      description: 'Para empresas medianas con múltiples ubicaciones y alto volumen',
      monthlyPrice: 799,
      annualPrice: 7990, // ~16% descuento anual

      // Limits
      maxUsers: 75,
      maxCompanies: 10,
      maxWarehouses: 25,
      maxWorkOrdersPerMonth: 2000,
      maxInventoryItems: 5000,
      maxStorageGB: 300,

      // Overage pricing
      overageUserPrice: 15,
      overageStoragePrice: 0.50,
      overageWorkOrderPrice: 1,

      isActive: true,

      // Features incluidos
      features: {
        create: PLAN_FEATURES.CORPORATE.map(module => ({ module }))
      }
    },
  })

  console.log('✅ Created Corporate plan:', corporate.name, `- $${corporate.monthlyPrice}/mes`)
  console.log('   Features:', PLAN_FEATURES.CORPORATE.join(', '))

  // Enterprise Plan - $1499/mes
  const enterprise = await prisma.subscriptionPlan.upsert({
    where: { name: 'Plan Enterprise' },
    update: {},
    create: {
      name: 'Plan Enterprise',
      tier: PlanTier.ENTERPRISE,
      description: 'Para grandes organizaciones con necesidades empresariales avanzadas',
      monthlyPrice: 1499,
      annualPrice: 14990, // ~16% descuento anual

      // Limits
      maxUsers: 200,
      maxCompanies: 50,
      maxWarehouses: 100,
      maxWorkOrdersPerMonth: 10000,
      maxInventoryItems: 20000,
      maxStorageGB: 1000,

      // Overage pricing
      overageUserPrice: 15,
      overageStoragePrice: 0.50,
      overageWorkOrderPrice: 1,

      isActive: true,

      // Features incluidos
      features: {
        create: PLAN_FEATURES.ENTERPRISE.map(module => ({ module }))
      }
    },
  })

  console.log('✅ Created Enterprise plan:', enterprise.name, `- $${enterprise.monthlyPrice}/mes`)
  console.log('   Features:', PLAN_FEATURES.ENTERPRISE.join(', '))

  console.log('\n🎉 Subscription plans seeded successfully!')
  console.log('\n📊 Summary:')
  console.log('- Starter:    $199/mes  | 10 usuarios  | 200 OT/mes')
  console.log('- Business:   $449/mes  | 25 usuarios  | 600 OT/mes')
  console.log('- Corporate:  $799/mes  | 75 usuarios  | 2000 OT/mes')
  console.log('- Enterprise: $1499/mes | 200 usuarios | 10000 OT/mes')
  console.log('\n💰 Ventaja vs MaintainX Premium ($65/usuario):')
  console.log('- 10 usuarios: $199 vs $650 (69% más barato)')
  console.log('- 25 usuarios: $449 vs $1625 (72% más barato)')
  console.log('- 75 usuarios: $799 vs $4875 (84% más barato)')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding subscription plans:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
