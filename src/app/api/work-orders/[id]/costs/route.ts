/**
 * PATCH /api/work-orders/[id]/costs
 *
 * Update work order costs (otherCosts and downtimeCost can be manually edited)
 * Labor and parts costs are auto-calculated
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AuthService } from "@/server/services/auth.service"
import { z } from "zod"

export const dynamic = "force-dynamic"

// Schema for cost update
const costUpdateSchema = z.object({
  otherCosts: z.number().min(0, "Other costs cannot be negative").optional(),
  downtimeCost: z.number().min(0, "Downtime cost cannot be negative").optional(),
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
    const { otherCosts, downtimeCost } = costUpdateSchema.parse(body)

    // Get current work order with costs
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: {
        id: true,
        status: true,
        actualCost: true,
        estimatedCost: true,
        laborCost: true,
        partsCost: true,
        otherCosts: true,
        downtimeCost: true,
      },
    })

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
    const newOtherCosts = otherCosts !== undefined ? otherCosts : (workOrder.otherCosts || 0)
    const newDowntimeCost = downtimeCost !== undefined ? downtimeCost : (workOrder.downtimeCost || 0)
    const newActualCost = laborCost + partsCost + newOtherCosts + newDowntimeCost

    // Prepare update data
    const updateData: {
      otherCosts?: number
      downtimeCost?: number
      actualCost: number
      updatedAt: Date
    } = {
      actualCost: newActualCost,
      updatedAt: new Date(),
    }

    if (otherCosts !== undefined) {
      updateData.otherCosts = otherCosts
    }

    if (downtimeCost !== undefined) {
      updateData.downtimeCost = downtimeCost
    }

    // Update costs
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData,
      select: {
        id: true,
        actualCost: true,
        laborCost: true,
        partsCost: true,
        otherCosts: true,
        downtimeCost: true,
      },
    })

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
