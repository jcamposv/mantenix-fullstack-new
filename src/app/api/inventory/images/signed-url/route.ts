import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_INVENTORY_BUCKET || process.env.AWS_S3_BUCKET || "mantenix-dev-inventory"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    // Extract the key from the S3 URL
    let key: string
    if (imageUrl.startsWith('http')) {
      // Extract key from full S3 URL
      const url = new URL(imageUrl)
      key = url.pathname.substring(1) // Remove leading slash
    } else {
      // Assume it's already a key
      key = imageUrl
    }

    // Generate signed URL for reading the image
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })

    return NextResponse.json({ signedUrl })

  } catch (error) {
    console.error("Error generating signed URL for inventory image:", error)
    return NextResponse.json(
      { error: "Error generating signed URL" },
      { status: 500 }
    )
  }
}
