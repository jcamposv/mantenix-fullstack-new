import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { PasswordResetService } from "@/server/services/password-reset.service"
import type { Role } from "@prisma/client"

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
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user || !session?.user.role) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { userId } = await params

    // Send reset link via service
    await PasswordResetService.sendResetLink(
      userId,
      session.user.id,
      session.user.role as Role,
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
