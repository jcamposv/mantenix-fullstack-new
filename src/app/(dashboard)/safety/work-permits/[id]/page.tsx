/**
 * Work Permit Detail Page
 *
 * Server Component for displaying work permit details.
 * Following Next.js Expert standards:
 * - Server Component for data fetching
 * - Type-safe with explicit types
 * - Permission checks via service layer
 * - Clean component composition
 */

import { notFound } from 'next/navigation'
import { AuthService } from '@/server/services/auth.service'
import { WorkPermitService } from '@/server/services/work-permit.service'
import { WorkPermitDetailClient } from '@/components/safety/work-permit-detail-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WorkPermitDetailPage({ params }: PageProps) {
  // 1. Authenticate user
  const session = await AuthService.getAuthenticatedSession()
  if (!session || session instanceof Response) {
    return notFound()
  }

  // 2. Get permit ID from params
  const { id } = await params

  // 3. Fetch permit data (includes permission check)
  try {
    const permit = await WorkPermitService.getById(id, session)

    if (!permit) {
      return notFound()
    }

    // 4. Render client component with data
    return <WorkPermitDetailClient permit={permit} />
  } catch (error) {
    console.error('Error fetching work permit:', error)
    return notFound()
  }
}
