/**
 * Component Technical Specifications Display
 *
 * Displays ISO 14224 technical specifications for a component.
 * Shows MTBF, MTTR, criticality, and life expectancy.
 *
 * Following Next.js Expert standards:
 * - Small focused component (<200 lines)
 * - Type-safe
 * - Reusable UI composition
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

interface ComponentTechnicalSpecsProps {
  mtbf?: number | null
  mttr?: number | null
  criticality?: 'A' | 'B' | 'C' | null
  lifeExpectancy?: number | null
}

const CRITICALITY_LABELS = {
  A: 'Crítico',
  B: 'Importante',
  C: 'Menor',
}

const CRITICALITY_VARIANTS = {
  A: 'destructive' as const,
  B: 'default' as const,
  C: 'secondary' as const,
}

export function ComponentTechnicalSpecs({
  mtbf,
  mttr,
  criticality,
  lifeExpectancy,
}: ComponentTechnicalSpecsProps) {
  // Don't render if no technical data
  if (!mtbf && !mttr && !criticality && !lifeExpectancy) {
    return null
  }

  return (
    <Card className="w-full shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Especificaciones Técnicas ISO 14224
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {criticality && (
          <div>
            <div className="text-sm font-medium text-muted-foreground">Criticidad</div>
            <div className="mt-1">
              <Badge variant={CRITICALITY_VARIANTS[criticality]}>
                Nivel {criticality} - {CRITICALITY_LABELS[criticality]}
              </Badge>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {mtbf && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">MTBF</div>
              <div className="mt-1 font-mono">{mtbf.toLocaleString()} hrs</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {(mtbf / 24).toFixed(0)} días
              </div>
            </div>
          )}

          {mttr && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">MTTR</div>
              <div className="mt-1 font-mono">{mttr.toLocaleString()} hrs</div>
            </div>
          )}

          {lifeExpectancy && (
            <div className="col-span-2">
              <div className="text-sm font-medium text-muted-foreground">
                Vida Útil Esperada
              </div>
              <div className="mt-1">{lifeExpectancy.toLocaleString()} horas</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {(lifeExpectancy / (24 * 365)).toFixed(1)} años
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
