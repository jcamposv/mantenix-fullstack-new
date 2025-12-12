/**
 * LOTO Procedures Card Component
 *
 * Displays Lock-Out/Tag-Out procedures linked to a work order.
 * Shows status, asset, and lock devices.
 *
 * Following Next.js Expert standards:
 * - Single Responsibility: Only displays LOTO procedures
 * - Type-safe with explicit interfaces
 * - Client component for navigation
 * - Under 200 lines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, ExternalLink } from 'lucide-react'
import { LOTOStatusBadge } from '@/components/workflow/loto-status-badge'
import { useRouter } from 'next/navigation'
import type { LOTOStatus } from '@/types/loto-procedure.types'

interface LOTOProcedure {
  id: string
  status: LOTOStatus
  appliedAt: string | null
  releasedAt: string | null
  asset: {
    id: string
    name: string
    assetTag: string
  } | null
  lockSerialNumbers: string[]
}

interface LOTOProceduresCardProps {
  procedures: LOTOProcedure[]
}

export function LOTOProceduresCard({ procedures }: LOTOProceduresCardProps) {
  const router = useRouter()

  if (!procedures || procedures.length === 0) {
    return null
  }

  const handleProcedureClick = (procedureId: string): void => {
    router.push(`/safety/loto-procedures/${procedureId}`)
  }

  const getDeviceCountText = (count: number): string => {
    return `${count} dispositivo${count !== 1 ? 's' : ''} de bloqueo`
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="h-5 w-5 text-red-600" />
          Procedimientos LOTO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {procedures.map((loto) => (
          <div
            key={loto.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleProcedureClick(loto.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <LOTOStatusBadge status={loto.status} />
                {loto.asset && (
                  <span className="text-sm font-medium">{loto.asset.name}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {getDeviceCountText(loto.lockSerialNumbers.length)}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
