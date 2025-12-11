/**
 * Root Cause Analysis Card Component
 *
 * Displays Root Cause Analyses (RCA) linked to a work order.
 * Shows failure mode, analysis type, status, and analyzer.
 *
 * Following Next.js Expert standards:
 * - Single Responsibility: Only displays RCAs
 * - Type-safe with explicit interfaces
 * - Client component for navigation
 * - Under 200 lines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, ExternalLink } from 'lucide-react'
import { RCAStatusBadge } from '@/components/workflow/rca-status-badge'
import { useRouter } from 'next/navigation'
import type { RCAStatus, RCAType } from '@/types/root-cause-analysis.types'

interface RootCauseAnalysis {
  id: string
  failureMode: string
  analysisType: RCAType
  status: RCAStatus
  analyzer: {
    id: string
    name: string
  } | null
}

interface RCACardProps {
  analyses: RootCauseAnalysis[]
}

function formatAnalysisType(type: string): string {
  return type.replace('_', ' ')
}

export function RCACard({ analyses }: RCACardProps) {
  const router = useRouter()

  if (!analyses || analyses.length === 0) {
    return null
  }

  const handleRCAClick = (rcaId: string): void => {
    router.push(`/quality/root-cause-analyses/${rcaId}`)
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Análisis de Causa Raíz (RCA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {analyses.map((rca) => (
          <div
            key={rca.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleRCAClick(rca.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <RCAStatusBadge status={rca.status} />
                <span className="text-xs text-muted-foreground uppercase">
                  {formatAnalysisType(rca.analysisType)}
                </span>
              </div>
              <p className="text-sm font-medium truncate">{rca.failureMode}</p>
              {rca.analyzer && (
                <p className="text-xs text-muted-foreground">
                  Por {rca.analyzer.name}
                </p>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
