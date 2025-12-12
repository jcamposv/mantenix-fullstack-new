/**
 * AI Configuration API for Super Admin
 * GET /api/admin/ai-config/[companyId] - Get AI config for a company
 * PUT /api/admin/ai-config/[companyId] - Update AI config for a company
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { AIConfigService } from "@/server/services/ai-config.service"

/**
 * GET /api/admin/ai-config/[companyId]
 * Get AI configuration and usage stats for a company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params

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

    // 2. Get AI config details
    const details = await AIConfigService.getCompanyAIConfigDetails(companyId)

    // 3. Get recent logs
    const recentLogs = await AIConfigService.getRecentUsageLogs(companyId, 10)

    return NextResponse.json({
      ...details,
      recentLogs
    })

  } catch (error) {
    console.error("Error fetching AI config:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/ai-config/[companyId]
 * Update AI configuration for a company
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params

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

    // 2. Parse and validate request body
    const body = await request.json()
    const { resetTokens, ...updates } = body

    // Validate updates
    const validatedUpdates = AIConfigService.validateConfigUpdates(updates)

    // 3. Update config
    if (resetTokens) {
      await AIConfigService.resetMonthlyTokens(companyId)
    }

    const config = await AIConfigService.updateCompanyAIConfig(
      companyId,
      validatedUpdates
    )

    return NextResponse.json({
      success: true,
      config
    })

  } catch (error) {
    console.error("Error updating AI config:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
