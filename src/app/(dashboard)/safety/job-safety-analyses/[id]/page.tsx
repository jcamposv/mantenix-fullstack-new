/**
 * Job Safety Analysis Detail Page
 *
 * Server Component for displaying JSA details.
 * Following Next.js Expert standards:
 * - Server Component for data fetching
 * - Type-safe with explicit types
 * - Permission checks via service layer
 * - Clean component composition
 */

import { notFound } from 'next/navigation'
import { AuthService } from '@/server/services/auth.service'
import { JobSafetyAnalysisService } from '@/server/services/job-safety-analysis.service'
import { JobSafetyAnalysisDetailClient } from '@/components/safety/job-safety-analysis-detail-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function JobSafetyAnalysisDetailPage({ params }: PageProps) {
  // 1. Authenticate user
  const session = await AuthService.getAuthenticatedSession()
  if (!session || session instanceof Response) {
    return notFound()
  }

  // 2. Get JSA ID from params
  const { id } = await params

  // 3. Fetch JSA data (includes permission check)
  try {
    const jsa = await JobSafetyAnalysisService.getById(id, session)

    if (!jsa) {
      return notFound()
    }

    // 4. Render client component with data
    return <JobSafetyAnalysisDetailClient jsa={jsa} />
  } catch (error) {
    console.error('Error fetching JSA:', error)
    return notFound()
  }
}
