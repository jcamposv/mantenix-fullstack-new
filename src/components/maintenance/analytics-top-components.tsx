/**
 * Analytics Top Components Component
 *
 * Table showing components with most alerts.
 * Following Next.js Expert standards:
 * - Separate file (< 150 lines)
 * - Type-safe props
 * - Clean UI
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { TopComponent } from '@/types/maintenance-analytics.types'

interface AnalyticsTopComponentsProps {
  components: TopComponent[]
}

/**
 * Get criticality badge variant
 */
function getCriticalityVariant(criticality: string | null): 'destructive' | 'default' | 'secondary' {
  if (!criticality) return 'secondary'
  if (criticality === 'A') return 'destructive'
  if (criticality === 'B') return 'default'
  return 'secondary'
}

/**
 * Analytics Top Components Component
 */
export function AnalyticsTopComponents({ components }: AnalyticsTopComponentsProps) {
  if (components.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Componentes</CardTitle>
          <CardDescription>Componentes con más alertas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay componentes con alertas activas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Componentes</CardTitle>
        <CardDescription>
          Componentes que requieren más atención
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {components.map((component, index) => (
            <Link
              key={component.componentId}
              href={`/admin/exploded-view-components/${component.componentId}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{component.componentName}</p>
                  {component.partNumber && (
                    <p className="text-xs text-muted-foreground">
                      P/N: {component.partNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {component.criticality && (
                  <Badge variant={getCriticalityVariant(component.criticality)}>
                    {component.criticality}
                  </Badge>
                )}
                <Badge variant="outline">
                  {component.alertCount} alerta{component.alertCount !== 1 ? 's' : ''}
                </Badge>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
