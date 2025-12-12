/**
 * Root Cause Analysis Detail Page
 *
 * Server Component for displaying RCA details.
 * Following Next.js Expert standards:
 * - Server Component for data fetching
 * - Type-safe with explicit types
 * - Permission checks via service layer
 * - Clean component composition
 */

import { notFound } from 'next/navigation'
import { AuthService } from '@/server/services/auth.service'
import { RootCauseAnalysisService } from '@/server/services/root-cause-analysis.service'
import { RootCauseAnalysisDetailClient } from '@/components/quality/root-cause-analysis-detail-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RootCauseAnalysisDetailPage({ params }: PageProps) {
  // 1. Authenticate user
  const session = await AuthService.getAuthenticatedSession()
  if (!session || session instanceof Response) {
    return notFound()
  }

  // 2. Get RCA ID from params
  const { id } = await params

  // 3. Fetch RCA data (includes permission check)
  try {
    const rca = await RootCauseAnalysisService.getById(id, session)

    if (!rca) {
      return notFound()
    }

    // 4. Render client component with data
    return <RootCauseAnalysisDetailClient rca={rca} />
  } catch (error) {
    console.error('Error fetching RCA:', error)
    return notFound()
  }
}
