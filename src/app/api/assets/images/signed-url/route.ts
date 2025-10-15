import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
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
      Bucket: process.env.AWS_ASSETS_IMAGES_BUCKET!,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })

    return NextResponse.json({ signedUrl })

  } catch (error) {
    console.error("Error generating signed URL:", error)
    return NextResponse.json(
      { error: "Error generating signed URL" },
      { status: 500 }
    )
  }
}