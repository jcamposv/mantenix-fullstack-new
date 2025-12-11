/**
 * Safety Briefings API Routes
 * Handles creation and retrieval of safety briefings with digital signatures
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { SafetyBriefingService } from '@/server/services/safety-briefing.service'
import { createSafetyBriefingSchema } from '@/schemas/safety-briefing.schema'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

/**
 * GET /api/safety-briefings?workOrderId=xxx&userId=xxx
 * Get safety briefing for a specific work order and user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const { searchParams } = new URL(request.url)
    const workOrderId = searchParams.get('workOrderId')
    const userId = searchParams.get('userId')

    if (!workOrderId || !userId) {
      return NextResponse.json(
        { error: 'Se requieren workOrderId y userId' },
        { status: 400 }
      )
    }

    const briefing = await SafetyBriefingService.getByWorkOrderAndUser(
      workOrderId,
      userId,
      session
    )

    return NextResponse.json({ briefing })
  } catch (error) {
    if (error instanceof Error && error.message.includes('No tienes permisos')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/safety-briefings
 * Create or update a safety briefing with digital signature
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    const body = await request.json()

    const validationResult = createSafetyBriefingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const briefing = await SafetyBriefingService.createOrUpdate(
      validationResult.data,
      session
    )

    return NextResponse.json(
      {
        briefing,
        message: 'Confirmación de seguridad guardada exitosamente'
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Error) {
      if (error.message.includes('No tienes permisos')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
