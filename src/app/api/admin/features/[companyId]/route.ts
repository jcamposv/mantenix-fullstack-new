import { NextRequest, NextResponse } from "next/server"
import { AuthService, FeatureService } from "@/server"

export const dynamic = 'force-dynamic'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const { companyId } = await params

    const features = await FeatureService.getCompanyFeatures(sessionResult, companyId)

    return NextResponse.json(features)

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No tienes permisos")) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error("Error fetching company features:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
