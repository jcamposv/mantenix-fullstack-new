import { NextRequest, NextResponse } from "next/server"
import { PasswordResetService } from "@/server/services/password-reset.service"
import type { SystemRoleKey } from "@/types/auth.types"
import { AuthService } from "@/server/services/auth.service"

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/reset-password/[userId]
 * Send password reset link to user
 * Only SUPER_ADMIN and ADMIN_EMPRESA can send password resets
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    const { userId } = await params

    // Send reset link via service
    await PasswordResetService.sendResetLink(
      userId,
      session.user.id,
      session.user.role as SystemRoleKey,
      session.user.companyId || null
    )

    return NextResponse.json({
      message: "Link de reseteo de contraseña enviado exitosamente"
    }, { status: 200 })

  } catch (error) {
    console.error("Error sending password reset:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al enviar link de reseteo de contraseña" },
      { status: 500 }
    )
  }
}
