import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_PROFILE_BUCKET || "mantenix-profiles"
const URL_EXPIRATION = 3600 // 1 hour in seconds

/**
 * GET /api/user/profile-photo/signed-url?key={key}
 * Genera una URL firmada para acceder a una foto de perfil en S3
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: "Se requiere el parámetro 'key'" },
        { status: 400 }
      )
    }

    // Si ya es una URL completa, retornarla tal cual
    if (key.startsWith('http')) {
      return NextResponse.json({ url: key })
    }

    // Generate signed URL
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRATION,
    })

    return NextResponse.json({ url: signedUrl })

  } catch (error) {
    console.error("Error generating signed URL for profile photo:", error)
    return NextResponse.json(
      { error: "Error al generar URL firmada" },
      { status: 500 }
    )
  }
}
