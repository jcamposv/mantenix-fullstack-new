/**
 * Safety Briefings Check API Route
 * Quick check if user has confirmed safety documents for a work order
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { SafetyBriefingService } from '@/server/services/safety-briefing.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/safety-briefings/check?workOrderId=xxx&userId=xxx
 * Check if user has confirmed safety documents for a work order
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const { searchParams } = new URL(request.url)
    const workOrderId = searchParams.get('workOrderId')
    const userId = searchParams.get('userId')

    if (!workOrderId || !userId) {
      return NextResponse.json(
        { error: 'Se requieren workOrderId y userId' },
        { status: 400 }
      )
    }

    const hasConfirmed = await SafetyBriefingService.hasUserConfirmed(
      workOrderId,
      userId
    )

    return NextResponse.json({ hasConfirmed })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
