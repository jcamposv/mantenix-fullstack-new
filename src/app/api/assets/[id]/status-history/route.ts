import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService, AssetStatusService } from "@/server"
import { assetStatusHistoryFiltersSchema } from "@/schemas/asset-status"

export const dynamic = 'force-dynamic'

/**
 * GET /api/assets/[id]/status-history
 * Get asset status history with pagination
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const { id } = await params

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const filters = assetStatusHistoryFiltersSchema.parse({
      assetId: id,
      status,
      startDate,
      endDate,
      page,
      limit
    })

    const result = await AssetStatusService.getAssetStatusHistory(
      filters,
      sessionResult
    )

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes("no encontrado")) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("acceso")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching asset status history:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
