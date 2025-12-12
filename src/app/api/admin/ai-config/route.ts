/**
 * AI Configuration List API for Super Admin
 * GET /api/admin/ai-config - Get all companies with AI config
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { AIConfigService } from "@/server/services/ai-config.service"

/**
 * GET /api/admin/ai-config
 * Get all companies with their AI configuration
 */
export async function GET() {
  try {
    // 1. Authenticate as super admin
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: {
          select: {
            key: true
          }
        }
      }
    })

    if (user?.role.key !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: "Forbidden - Super Admin only" },
        { status: 403 }
      )
    }

    // 2. Get all companies with AI config
    const companies = await AIConfigService.getAllCompaniesAIConfig()

    return NextResponse.json({
      companies
    })

  } catch (error) {
    console.error("Error fetching AI configs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
