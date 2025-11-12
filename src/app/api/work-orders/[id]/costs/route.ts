/**
 * PATCH /api/work-orders/[id]/costs
 *
 * Update work order costs (only otherCosts can be manually edited)
 * Labor and parts costs are auto-calculated
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AuthService } from "@/server/services/auth.service"
import { z } from "zod"

export const dynamic = "force-dynamic"

// Schema for cost update
const costUpdateSchema = z.object({
  otherCosts: z.number().min(0, "Other costs cannot be negative"),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params
    const workOrderId = params.id

    // Get authenticated session
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    // Only JEFE_MANTENIMIENTO, ADMIN_EMPRESA, ADMIN_GRUPO, SUPER_ADMIN can edit costs
    const authorizedRoles = [
      "JEFE_MANTENIMIENTO",
      "ADMIN_EMPRESA",
      "ADMIN_GRUPO",
      "SUPER_ADMIN",
    ]

    if (!authorizedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para ajustar costos" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { otherCosts } = costUpdateSchema.parse(body)

    // Get current work order with costs
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: {
        id: true,
        status: true,
        actualCost: true,
        estimatedCost: true,
      },
    }) as { id: string; status: string; actualCost: number | null; estimatedCost: number | null; laborCost?: number | null; partsCost?: number | null; otherCosts?: number | null } | null

    if (!workOrder) {
      return NextResponse.json(
        { error: "Orden de trabajo no encontrada" },
        { status: 404 }
      )
    }

    // Only allow editing completed work orders
    if (workOrder.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error:
            "Solo se pueden ajustar costos de órdenes completadas",
        },
        { status: 400 }
      )
    }

    // Calculate new total cost
    const laborCost = workOrder.laborCost || 0
    const partsCost = workOrder.partsCost || 0
    const newActualCost = laborCost + partsCost + otherCosts

    // Update costs
    // Note: Type assertion needed until Prisma client is regenerated
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        otherCosts,
        actualCost: newActualCost,
        updatedAt: new Date(),
      } as { otherCosts: number; actualCost: number; updatedAt: Date },
      select: {
        id: true,
        actualCost: true,
      },
    }) as { id: string; actualCost: number | null; laborCost?: number | null; partsCost?: number | null; otherCosts?: number | null }
    
    // Manually add the values for response since select might not work for these fields
    updatedWorkOrder.laborCost = laborCost
    updatedWorkOrder.partsCost = partsCost
    updatedWorkOrder.otherCosts = otherCosts

    return NextResponse.json({
      success: true,
      data: updatedWorkOrder,
    })
  } catch (error) {
    console.error("Error updating work order costs:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: error.issues,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
