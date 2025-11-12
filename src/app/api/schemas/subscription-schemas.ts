import { z } from "zod"

// Enums
const PlanTierEnum = z.enum(["STARTER", "BUSINESS", "CORPORATE", "ENTERPRISE", "CUSTOM"])
const BillingIntervalEnum = z.enum(["MONTHLY", "ANNUAL"])
const SubscriptionStatusEnum = z.enum([
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "TRIALING",
  "INCOMPLETE",
  "PAUSED"
])

// Subscription Plan Schemas
export const createPlanSchema = z.object({
  name: z.string().min(1, "El nombre del plan es requerido").max(255),
  tier: PlanTierEnum,
  description: z.string().optional().nullable(),

  // Pricing
  monthlyPrice: z.number().min(0, "El precio mensual debe ser mayor o igual a 0"),
  annualPrice: z.number().min(0, "El precio anual debe ser mayor o igual a 0"),

  // Limits
  maxUsers: z.number().int().min(1, "Debe permitir al menos 1 usuario"),
  maxCompanies: z.number().int().min(1, "Debe permitir al menos 1 compañía"),
  maxWarehouses: z.number().int().min(1, "Debe permitir al menos 1 bodega"),
  maxWorkOrdersPerMonth: z.number().int().min(1, "Debe permitir al menos 1 orden de trabajo"),
  maxInventoryItems: z.number().int().min(1, "Debe permitir al menos 1 item de inventario"),
  maxStorageGB: z.number().min(0.1, "Debe permitir al menos 0.1 GB de almacenamiento"),

  // Features incluidos (FeatureModule[])
  features: z.array(z.string()).default([]),

  // Overage Pricing
  overageUserPrice: z.number().min(0, "El precio por usuario extra debe ser mayor o igual a 0").default(15),
  overageStoragePrice: z.number().min(0, "El precio por GB extra debe ser mayor o igual a 0").default(0.5),
  overageWorkOrderPrice: z.number().min(0, "El precio por orden extra debe ser mayor o igual a 0").default(1),

  isActive: z.boolean().default(true),
})

export const updatePlanSchema = z.object({
  name: z.string().min(1, "El nombre del plan es requerido").max(255).optional(),
  tier: PlanTierEnum.optional(),
  description: z.string().optional().nullable(),

  // Pricing
  monthlyPrice: z.coerce.number().min(0).optional(),
  annualPrice: z.coerce.number().min(0).optional(),

  // Limits
  maxUsers: z.coerce.number().int().min(1).optional(),
  maxCompanies: z.coerce.number().int().min(1).optional(),
  maxWarehouses: z.coerce.number().int().min(1).optional(),
  maxWorkOrdersPerMonth: z.coerce.number().int().min(1).optional(),
  maxInventoryItems: z.coerce.number().int().min(1).optional(),
  maxStorageGB: z.coerce.number().min(0.1).optional(),

  // Features incluidos (FeatureModule[])
  features: z.array(z.string()).optional(),

  // Overage Pricing
  overageUserPrice: z.coerce.number().min(0).optional(),
  overageStoragePrice: z.coerce.number().min(0).optional(),
  overageWorkOrderPrice: z.coerce.number().min(0).optional(),

  isActive: z.boolean().optional(),
})

// Subscription Schemas
export const createSubscriptionSchema = z.object({
  companyId: z.string().min(1, "La compañía es requerida"),
  planId: z.string().min(1, "El plan es requerido"),
  billingInterval: BillingIntervalEnum,
  startDate: z.coerce.date().optional(),

  // Stripe data (optional)
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  stripePaymentMethodId: z.string().optional(),
})

export const updateSubscriptionSchema = z.object({
  planId: z.string().optional(),
  billingInterval: BillingIntervalEnum.optional(),
  status: SubscriptionStatusEnum.optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  canceledAt: z.coerce.date().optional().nullable(),

  // Stripe data
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  stripePaymentMethodId: z.string().optional(),
})

// Export types
export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>
