import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/server/services/auth.service"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export const dynamic = 'force-dynamic'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_WORK_ORDER_MEDIA_BUCKET || "mantenix-work-order-media-dev"
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB for videos
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB for images (reduced for better performance)

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    // Check if user can upload work order media (technicians, supervisors, admins)
    const allowedRoles = ["TECNICO", "SUPERVISOR", "ADMIN_EMPRESA", "SUPER_ADMIN"]
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const workOrderId = formData.get('workOrderId') as string
    const fieldId = formData.get('fieldId') as string
    const fieldType = formData.get('fieldType') as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!workOrderId || !fieldId || !fieldType) {
      return NextResponse.json({ 
        error: "Missing required fields: workOrderId, fieldId, fieldType" 
      }, { status: 400 })
    }

    // Validate file size based on type
    const isVideo = fieldType.includes('VIDEO')
    const maxSize = isVideo ? MAX_FILE_SIZE : MAX_IMAGE_SIZE
    
    if (file.size > maxSize) {
      const sizeLimitMB = isVideo ? 50 : 5
      return NextResponse.json({ 
        error: `File size exceeds ${sizeLimitMB}MB limit` 
      }, { status: 400 })
    }

    // Validate file type
    // NOTA: Los tipos MIME de video deben incluir todos los formatos comunes de móviles:
    // - video/quicktime: Formato nativo de iOS (.mov)
    // - video/mp4: Formato estándar (.mp4)
    // - video/webm: Formato web (.webm)
    // - video/3gpp, video/3gpp2: Formatos móviles (.3gp, .3g2)
    // - video/x-msvideo: Formato AVI (.avi)
    // - video/x-matroska: Formato MKV (.mkv)
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
    const allowedVideoTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',  // iOS MOV format - este era el problema: faltaba este tipo
      'video/3gpp',       // Mobile 3GP format
      'video/3gpp2',      // Mobile 3G2 format
      'video/x-msvideo',  // AVI format
      'video/x-matroska', // MKV format
      'video/ogg'         // OGG video format
    ]
    const allowedTypes = isVideo ? allowedVideoTypes : allowedImageTypes

    if (!allowedTypes.includes(file.type)) {
      const expectedType = isVideo ? 'videos (MP4, MOV, WebM, 3GP)' : 'imágenes (JPEG, PNG, GIF, WebP)'
      console.error(`Invalid file type: ${file.type}. Expected ${expectedType}`)
      return NextResponse.json({
        error: `Tipo de archivo no válido: ${file.type}. Solo se permiten ${expectedType}.`
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${extension}`
    
    // Structure: {companyId}/{workOrderId}/{fieldId}/{fileName}
    const companyId = session.user.companyId || 'unknown'
    const key = `${companyId}/${workOrderId}/${fieldId}/${fileName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        workOrderId,
        fieldId,
        fieldType,
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString()
      }
    })

    await s3Client.send(command)

    // Construct the public URL
    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`

    return NextResponse.json({ 
      url,
      key,
      size: file.size,
      type: file.type,
      workOrderId,
      fieldId,
      fieldType
    })

  } catch (error) {
    console.error("Error uploading work order media:", error)
    return NextResponse.json(
      { error: "Failed to upload work order media" },
      { status: 500 }
    )
  }
}