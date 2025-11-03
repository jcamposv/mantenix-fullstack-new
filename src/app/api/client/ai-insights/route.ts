/**
 * AI Insights API Route
 *
 * Generates AI-powered insights for client dashboard
 * GET /api/client/ai-insights
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AIAnalyticsService } from "@/server/services/ai-analytics.service"

export const dynamic = 'force-dynamic'

/**
 * GET /api/client/ai-insights
 * Generate AI insights for the authenticated user's company
 *
 * Query params:
 *  - dateFrom: ISO date string (optional)
 *  - dateTo: ISO date string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Get user with company info
    const { prisma } = await import("@/lib/prisma")
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        companyId: true,
        clientCompanyId: true,
        siteId: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 3. Parse date range from query params
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const dateRange = (dateFrom && dateTo) ? {
      from: new Date(dateFrom),
      to: new Date(dateTo)
    } : undefined

    // 4. Determine which company to use for AI (simple, role-agnostic logic)
    let companyId: string // Company to use for AI feature check and billing
    let isExternalUser = false

    // Check if user belongs to a client company (external user)
    if (user.clientCompanyId) {
      isExternalUser = true

      // External user → use provider company (tenant) for AI features
      const clientCompany = await prisma.clientCompany.findUnique({
        where: { id: user.clientCompanyId },
        select: {
          id: true,
          name: true,
          tenantCompanyId: true
        }
      })

      if (!clientCompany) {
        return NextResponse.json(
          { error: "Client company not found" },
          { status: 404 }
        )
      }

      // Use provider company for AI features and billing
      companyId = clientCompany.tenantCompanyId

      console.log('[AI Insights API] External user:', {
        userId: user.id,
        role: user.role,
        clientCompanyId: user.clientCompanyId,
        providerCompanyId: companyId
      })
    } else if (user.companyId) {
      // Internal user (provider) → use their own company
      companyId = user.companyId

      console.log('[AI Insights API] Internal user:', {
        userId: user.id,
        role: user.role,
        companyId: user.companyId
      })
    } else {
      return NextResponse.json(
        { error: "User not associated with any company" },
        { status: 400 }
      )
    }

    console.log('[AI Insights API] Checking AI availability for companyId:', companyId)

    // 5. Check AI availability (will check the selected company)
    const canGenerate = await AIAnalyticsService.canGenerateInsights(companyId)
    console.log('[AI Insights API] Can generate result:', canGenerate)

    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        {
          error: canGenerate.reason || "Cannot generate insights",
          canGenerate: false
        },
        { status: 403 }
      )
    }

    // 6. Generate insights based on user type (external vs internal)
    let insights

    if (isExternalUser && user.clientCompanyId) {
      // External user (client company) → Client-focused insights
      // Shows provider performance from client perspective
      insights = await AIAnalyticsService.generateClientInsights(
        companyId, // Provider company ID (for AI features & billing)
        user.clientCompanyId, // Client company ID (for data filtering)
        user.siteId || null, // Site filter if user is site-specific
        userId,
        dateRange
      )
    } else {
      // Internal user (provider company) → Dashboard insights
      // Shows their own company's operations
      insights = await AIAnalyticsService.generateDashboardInsights(
        companyId,
        userId,
        dateRange
      )
    }

    // 7. Return insights
    return NextResponse.json({
      success: true,
      data: insights,
      canGenerate: true
    })

  } catch (error) {
    console.error("Error generating AI insights:", error)

    // Return error details
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const isLimitError = errorMessage.includes("limit")

    return NextResponse.json(
      {
        error: errorMessage,
        canGenerate: !isLimitError
      },
      { status: isLimitError ? 403 : 500 }
    )
  }
}
