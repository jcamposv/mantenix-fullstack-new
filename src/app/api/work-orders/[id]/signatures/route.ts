/**
 * Work Order Digital Signatures API Route
 *
 * GET /api/work-orders/[id]/signatures
 * Fetches all digital signatures for a work order (ISO compliance audit trail)
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { DigitalSignatureService } from '@/server/services/digital-signature.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await AuthService.getAuthenticatedSession()
    if (session instanceof NextResponse) {
      return session
    }

    // 2. Get work order ID
    const { id } = await params

    // 3. Fetch signatures for this work order
    const signatures = await DigitalSignatureService.getSignaturesByEntity(
      'WORK_ORDER',
      id
    )

    // 4. Return signatures
    return NextResponse.json({ signatures })
  } catch (error) {
    console.error('Error fetching work order signatures:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener firmas digitales' },
      { status: 500 }
    )
  }
}
