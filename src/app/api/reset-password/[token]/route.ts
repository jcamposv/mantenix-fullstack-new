import { NextRequest, NextResponse } from "next/server"
import { PasswordResetService } from "@/server/services/password-reset.service"
import { resetPasswordApiSchema } from "@/schemas/password-reset"
import { ZodError } from "zod"

/**
 * POST /api/reset-password/[token]
 * Reset user password using valid token
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Validate request body
    const data = resetPasswordApiSchema.parse({
      token,
      newPassword: body.newPassword
    })

    // Reset password via service
    await PasswordResetService.resetPassword(data.token, data.newPassword)

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente"
    }, { status: 200 })

  } catch (error) {
    console.error("Error resetting password:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al resetear contraseña" },
      { status: 500 }
    )
  }
}
