import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const dynamic = 'force-dynamic'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_WORK_ORDER_MEDIA_BUCKET || "mantenix-work-order-media-dev"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaUrl } = await request.json()

    if (!mediaUrl) {
      return NextResponse.json(
        { error: "Media URL is required" },
        { status: 400 }
      )
    }

    // Extract the key from the S3 URL
    let key: string
    if (mediaUrl.startsWith('http')) {
      // Extract key from full S3 URL
      const url = new URL(mediaUrl)
      key = url.pathname.substring(1) // Remove leading slash
    } else {
      // Assume it's already a key
      key = mediaUrl
    }

    // Generate signed URL for reading the media
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })

    return NextResponse.json({ signedUrl })

  } catch (error) {
    console.error("Error generating signed URL for work order media:", error)
    return NextResponse.json(
      { error: "Error generating signed URL" },
      { status: 500 }
    )
  }
}