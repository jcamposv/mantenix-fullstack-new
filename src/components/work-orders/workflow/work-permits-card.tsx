/**
 * Work Permits Card Component
 *
 * Displays work permits linked to a work order.
 * Shows permit type, status, location, and validity dates.
 *
 * Following Next.js Expert standards:
 * - Single Responsibility: Only displays work permits
 * - Type-safe with explicit interfaces
 * - Client component for navigation
 * - Under 200 lines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert, ExternalLink } from 'lucide-react'
import { PermitStatusBadge } from '@/components/workflow/permit-status-badge'
import { PermitTypeBadge } from '@/components/workflow/permit-type-badge'
import { useRouter } from 'next/navigation'
import type { PermitStatus, PermitType } from '@/types/work-permit.types'

interface WorkPermit {
  id: string
  permitType: PermitType
  status: PermitStatus
  location: string
  validFrom: string | null
  validUntil: string | null
}

interface WorkPermitsCardProps {
  permits: WorkPermit[]
}

function formatDateRange(from: string | null, until: string | null): string {
  if (!from || !until) {
    return 'Fechas no definidas'
  }

  const fromDate = new Date(from).toLocaleDateString('es-ES')
  const untilDate = new Date(until).toLocaleDateString('es-ES')

  return `${fromDate} - ${untilDate}`
}

export function WorkPermitsCard({ permits }: WorkPermitsCardProps) {
  const router = useRouter()

  if (!permits || permits.length === 0) {
    return null
  }

  const handlePermitClick = (permitId: string): void => {
    router.push(`/safety/work-permits/${permitId}`)
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-orange-600" />
          Permisos de Trabajo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {permits.map((permit) => (
          <div
            key={permit.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handlePermitClick(permit.id)}
          >
            <div className="flex items-center gap-3 flex-1">
              <PermitTypeBadge permitType={permit.permitType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{permit.location}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(permit.validFrom, permit.validUntil)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PermitStatusBadge status={permit.status} />
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
