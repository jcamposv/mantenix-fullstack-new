/**
 * CAP Action Detail Page
 *
 * Server Component for displaying CAPA (Corrective and Preventive Action) details.
 * Following Next.js Expert standards:
 * - Server Component for data fetching
 * - Type-safe with explicit types
 * - Permission checks via service layer
 * - Clean component composition
 */

import { notFound } from 'next/navigation'
import { AuthService } from '@/server/services/auth.service'
import { CAPActionService } from '@/server/services/cap-action.service'
import { CAPActionDetailClient } from '@/components/quality/cap-action-detail-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CAPActionDetailPage({ params }: PageProps) {
  // 1. Authenticate user
  const session = await AuthService.getAuthenticatedSession()
  if (!session || session instanceof Response) {
    return notFound()
  }

  // 2. Get CAP Action ID from params
  const { id } = await params

  // 3. Fetch CAP Action data (includes permission check)
  try {
    const action = await CAPActionService.getById(id, session)

    if (!action) {
      return notFound()
    }

    // 4. Render client component with data
    return <CAPActionDetailClient action={action} />
  } catch (error) {
    console.error('Error fetching CAP Action:', error)
    return notFound()
  }
}
