import { NextRequest, NextResponse } from "next/server"
import { AuthService, UserProfilePhotoService } from "@/server"

export const dynamic = 'force-dynamic'

/**
 * POST /api/user/profile-photo
 * Sube una foto de perfil
 * - Si updateUser=true (default): Sube a S3 Y actualiza el usuario autenticado en DB
 * - Si updateUser=false: Solo sube a S3 y retorna la URL (para formularios de admin)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    // Obtener archivo del form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const updateUser = formData.get('updateUser') !== 'false' // Default true

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    if (updateUser) {
      // Modo normal: Subir Y actualizar usuario autenticado
      const result = await UserProfilePhotoService.uploadProfilePhoto(session, file)

      return NextResponse.json({
        message: "Foto de perfil subida exitosamente",
        url: result.url,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          image: result.user.image
        }
      })
    } else {
      // Modo formulario: Solo subir a S3, no actualizar DB
      const uploadResult = await UserProfilePhotoService.uploadToS3Only(session, file)

      return NextResponse.json({
        message: "Foto subida exitosamente",
        url: uploadResult.url
      })
    }

  } catch (error) {
    console.error("Error uploading profile photo:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al subir la foto de perfil" },
      { status: 500 }
    )
  }
}
