/**
 * Job Safety Analyses Card Component
 *
 * Displays Job Safety Analyses (JSA) linked to a work order.
 * Shows status, preparer, and job steps count.
 *
 * Following Next.js Expert standards:
 * - Single Responsibility: Only displays JSAs
 * - Type-safe with explicit interfaces
 * - Client component for navigation
 * - Under 200 lines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HardHat, ExternalLink } from 'lucide-react'
import { JSAStatusBadge } from '@/components/workflow/jsa-status-badge'
import { useRouter } from 'next/navigation'
import type { JSAStatus } from '@/types/job-safety-analysis.types'

interface JobSafetyAnalysis {
  id: string
  status: JSAStatus
  preparer: {
    id: string
    name: string
  } | null
  jobSteps: unknown[]
}

interface JSACardProps {
  analyses: JobSafetyAnalysis[]
}

export function JSACard({ analyses }: JSACardProps) {
  const router = useRouter()

  if (!analyses || analyses.length === 0) {
    return null
  }

  const handleJSAClick = (jsaId: string): void => {
    router.push(`/safety/job-safety-analyses/${jsaId}`)
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HardHat className="h-5 w-5 text-yellow-600" />
          Análisis de Seguridad (JSA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {analyses.map((jsa) => (
          <div
            key={jsa.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleJSAClick(jsa.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <JSAStatusBadge status={jsa.status} />
                {jsa.preparer && (
                  <span className="text-xs text-muted-foreground">
                    Por {jsa.preparer.name}
                  </span>
                )}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
