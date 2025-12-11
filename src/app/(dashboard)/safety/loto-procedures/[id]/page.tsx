/**
 * LOTO Procedure Detail Page
 *
 * Server Component for displaying LOTO procedure details.
 * Following Next.js Expert standards:
 * - Server Component for data fetching
 * - Type-safe with explicit types
 * - Permission checks via service layer
 * - Clean component composition
 */

import { notFound } from 'next/navigation'
import { AuthService } from '@/server/services/auth.service'
import { LOTOProcedureService } from '@/server/services/loto-procedure.service'
import { LOTOProcedureDetailClient } from '@/components/safety/loto-procedure-detail-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LOTOProcedureDetailPage({ params }: PageProps) {
  // 1. Authenticate user
  const session = await AuthService.getAuthenticatedSession()
  if (!session || session instanceof Response) {
    return notFound()
  }

  // 2. Get procedure ID from params
  const { id } = await params

  // 3. Fetch procedure data (includes permission check)
  try {
    const procedure = await LOTOProcedureService.getById(id, session)

    if (!procedure) {
      return notFound()
    }

    // 4. Render client component with data
    return <LOTOProcedureDetailClient procedure={procedure} />
  } catch (error) {
    console.error('Error fetching LOTO procedure:', error)
    return notFound()
  }
}
