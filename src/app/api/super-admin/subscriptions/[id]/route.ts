/**
 * API Routes for Single Subscription (SUPER_ADMIN only)
 * GET /api/super-admin/subscriptions/[id] - Get subscription by ID
 * PATCH /api/super-admin/subscriptions/[id] - Update subscription
 */

import { NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { SubscriptionService } from "@/server/services/subscription.service"
import { SubscriptionRepository } from "@/server/repositories/subscription.repository"
import type { UpdateSubscriptionInput } from "@/types/subscription.types"

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

    // Only SUPER_ADMIN can view subscriptions
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const subscription = await SubscriptionRepository.findById(id)

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscripción no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("[API] Error fetching subscription:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener subscripción" },
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

    // Only SUPER_ADMIN can update subscriptions
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const data: Partial<UpdateSubscriptionInput> = await request.json()

    const subscription = await SubscriptionService.updateSubscription({
      id,
      ...data,
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("[API] Error updating subscription:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar subscripción" },
      { status: 500 }
    )
  }
}
