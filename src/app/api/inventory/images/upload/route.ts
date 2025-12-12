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

const BUCKET_NAME = process.env.AWS_INVENTORY_BUCKET || process.env.AWS_S3_BUCKET || "mantenix-dev-inventory"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB for inventory images

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    // Check if user has permission to upload inventory images
    const allowedRoles = ["SUPER_ADMIN", "ADMIN_GRUPO", "ADMIN_EMPRESA", "JEFE_MANTENIMIENTO"]
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const companyId = formData.get('companyId') as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${extension}`
    const key = `inventory/${companyId}/${fileName}`

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
        companyId: companyId,
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString()
      }
    })

    await s3Client.send(command)

    // Construct the S3 URL (not public, will need signed URL to view)
    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`

    return NextResponse.json({
      url,
      key,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("Error uploading inventory image:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}
