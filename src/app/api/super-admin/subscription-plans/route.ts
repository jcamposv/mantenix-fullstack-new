/**
 * API Routes for Subscription Plans Management (SUPER_ADMIN only)
 * GET /api/super-admin/subscription-plans - List all plans
 * POST /api/super-admin/subscription-plans - Create a new plan
 */

import { NextResponse } from "next/server"
import { FeatureModule } from "@prisma/client"
import { AuthService } from "@/server/services/auth.service"
import { SubscriptionPlanRepository } from "@/server/repositories/subscription-plan.repository"
import type { CreatePlanInput } from "@/app/api/schemas/subscription-schemas"

export const GET = async () => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    // If sessionResult is a NextResponse, it's an error response
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Only SUPER_ADMIN can manage subscription plans
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const plans = await SubscriptionPlanRepository.findMany({})

    return NextResponse.json(plans)
  } catch (error) {
    console.error("[API] Error fetching subscription plans:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener planes de subscripción" },
      { status: 500 }
    )
  }
}

export const POST = async (request: Request) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    // If sessionResult is a NextResponse, it's an error response
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Only SUPER_ADMIN can create plans
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const data: CreatePlanInput = await request.json()

    const plan = await SubscriptionPlanRepository.create({
      name: data.name,
      tier: data.tier,
      monthlyPrice: data.monthlyPrice,
      annualPrice: data.annualPrice,
      maxUsers: data.maxUsers,
      maxCompanies: data.maxCompanies,
      maxWarehouses: data.maxWarehouses,
      maxWorkOrdersPerMonth: data.maxWorkOrdersPerMonth,
      maxInventoryItems: data.maxInventoryItems,
      maxStorageGB: data.maxStorageGB,
      overageUserPrice: data.overageUserPrice,
      overageStoragePrice: data.overageStoragePrice,
      overageWorkOrderPrice: data.overageWorkOrderPrice,
      description: data.description,
      isActive: data.isActive ?? true,
      features: {
        create: (data.features || []).map((module: string) => ({ module: module as FeatureModule }))
      }
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating subscription plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear plan de subscripción" },
      { status: 500 }
    )
  }
}
