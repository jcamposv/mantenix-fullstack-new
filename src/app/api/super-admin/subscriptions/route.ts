/**
 * API Routes for Subscriptions Management (SUPER_ADMIN only)
 * GET /api/super-admin/subscriptions - List all subscriptions
 * POST /api/super-admin/subscriptions - Create a new subscription
 */

import { NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { SubscriptionService } from "@/server/services/subscription.service"
import { SubscriptionRepository } from "@/server/repositories/subscription.repository"
import type { CreateSubscriptionInput } from "@/types/subscription.types"

export const GET = async (request: Request) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    // If sessionResult is a NextResponse, it's an error response
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Only SUPER_ADMIN can view all subscriptions
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "10")

    const { items, total } = await SubscriptionRepository.findMany(
      {},
      page,
      limit
    )

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("[API] Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener subscripciones" },
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

    // Only SUPER_ADMIN can create subscriptions
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      )
    }

    const data: CreateSubscriptionInput = await request.json()

    const subscription = await SubscriptionService.createSubscription(data)

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating subscription:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear subscripción" },
      { status: 500 }
    )
  }
}
