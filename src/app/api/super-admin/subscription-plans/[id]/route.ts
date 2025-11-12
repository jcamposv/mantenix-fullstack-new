/**
 * API Routes for Single Subscription Plan (SUPER_ADMIN only)
 * GET /api/super-admin/subscription-plans/[id] - Get plan by ID
 * PATCH /api/super-admin/subscription-plans/[id] - Update plan
 * DELETE /api/super-admin/subscription-plans/[id] - Deactivate plan
 */

import { NextResponse } from "next/server"
import { FeatureModule } from "@prisma/client"
import { AuthService } from "@/server/services/auth.service"
import { SubscriptionPlanRepository } from "@/server/repositories/subscription-plan.repository"
import { prisma } from "@/lib/prisma"
import type { UpdatePlanInput } from "@/app/api/schemas/subscription-schemas"

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    const { id } = await params

    // If sessionResult is a NextResponse, it's an error response
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Only SUPER_ADMIN can view plans
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const plan = await SubscriptionPlanRepository.findById(id)

    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error("[API] Error fetching subscription plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener plan" },
      { status: 500 }
    )
  }
}

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    const { id } = await params

    // If sessionResult is a NextResponse, it's an error response
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Only SUPER_ADMIN can update plans
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const data: UpdatePlanInput = await request.json()

    // Si se están actualizando features, manejarlos por separado
    if (data.features !== undefined) {
      // Eliminar features existentes y crear nuevos
      await prisma.planFeature.deleteMany({ where: { planId: id } })

      if (data.features.length > 0) {
        await prisma.planFeature.createMany({
          data: data.features.map((module: string) => ({
            planId: id,
            module: module as FeatureModule
          }))
        })
      }

      // Eliminar features del objeto data antes de actualizar el plan
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { features, ...planData } = data
      const plan = await SubscriptionPlanRepository.update(id, planData)
      return NextResponse.json(plan)
    }

    // Remove features from data if present
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { features, ...planData } = data
    const plan = await SubscriptionPlanRepository.update(id, planData)
    return NextResponse.json(plan)
  } catch (error) {
    console.error("[API] Error updating subscription plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar plan" },
      { status: 500 }
    )
  }
}

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    const { id } = await params

    // If sessionResult is a NextResponse, it's an error response
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Only SUPER_ADMIN can delete plans
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const plan = await SubscriptionPlanRepository.delete(id)

    return NextResponse.json(plan)
  } catch (error) {
    console.error("[API] Error deleting subscription plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar plan" },
      { status: 500 }
    )
  }
}
