import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { SuperAdminService } from "@/server/services/super-admin.service"
import type { AuthenticatedSession } from "@/types/auth.types"

export const GET = async (request: NextRequest) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const metrics = await SuperAdminService.getMetrics(session as AuthenticatedSession)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching metrics:", error)

    if (error instanceof Error && error.message === "No autorizado") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener métricas" },
      { status: 500 }
    )
  }
}
