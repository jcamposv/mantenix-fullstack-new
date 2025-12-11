/**
 * Maintenance Component Card
 *
 * Displays maintenance component information for work orders created from MTBF alerts.
 * Only shown when PREDICTIVE_MAINTENANCE feature is enabled.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Type-safe props
 * - Under 200 lines
 * - Clean composition
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Wrench,
  AlertTriangle,
  Clock,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ComponentCriticality, FrequencyUnit } from '@prisma/client'
import {
  getCriticalityVariant,
  getCriticalityLabel,
  formatHours,
  formatMaintenanceInterval,
  formatNextMaintenance,
} from '@/lib/maintenance-formatters'

interface MaintenanceComponentData {
  id: string
  name: string
  partNumber: string | null
  criticality: ComponentCriticality | null
  mtbf: number | null
  lifeExpectancy: number | null
  // Hybrid maintenance scheduling
  manufacturerMaintenanceInterval: number | null
  manufacturerMaintenanceIntervalUnit: FrequencyUnit | null
  workOrderSchedule?: {
    id: string
    name: string
    recurrenceType: string
    nextGenerationDate: string | null
    isActive: boolean
  } | null
}

interface MaintenanceComponentCardProps {
  component: MaintenanceComponentData
}

export function MaintenanceComponentCard({ component }: MaintenanceComponentCardProps) {
  const router = useRouter()

  const handleViewComponent = () => {
    router.push(`/admin/exploded-view-components/${component.id}`)
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <CardTitle className="text-lg">Mantenimiento Predictivo</CardTitle>
              <CardDescription>
                Componente bajo monitoreo MTBF
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300">
            ISO 14224
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Component Name */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Componente</h4>
          <p className="font-medium text-base">{component.name}</p>
          {component.partNumber && (
            <p className="text-sm text-muted-foreground">P/N: {component.partNumber}</p>
          )}
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Criticality */}
          {component.criticality && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Criticidad</span>
              </div>
              <Badge variant={getCriticalityVariant(component.criticality)}>
                {getCriticalityLabel(component.criticality)}
              </Badge>
            </div>
          )}

          {/* MTBF */}
          {component.mtbf && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>MTBF</span>
              </div>
              <p className="font-mono text-sm font-medium">
                {formatHours(component.mtbf)}
              </p>
            </div>
          )}

          {/* Life Expectancy */}
          {component.lifeExpectancy && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Vida Útil</span>
              </div>
              <p className="font-mono text-sm font-medium">
                {formatHours(component.lifeExpectancy)}
              </p>
            </div>
          )}
        </div>

        {/* Scheduled Maintenance Info */}
        {component.workOrderSchedule && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Mantenimiento Programado
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interval */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Frecuencia</span>
                </div>
                <p className="text-sm font-medium">
                  {formatMaintenanceInterval(
                    component.manufacturerMaintenanceInterval,
                    component.manufacturerMaintenanceIntervalUnit
                  )}
                </p>
              </div>

              {/* Next Maintenance */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Próximo Mantenimiento</span>
                </div>
                <p className="text-sm font-medium">
                  {formatNextMaintenance(component.workOrderSchedule.nextGenerationDate)}
                </p>
              </div>
            </div>
            {component.workOrderSchedule.isActive && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                Schedule Activo
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewComponent}
            className="w-full md:w-auto"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Detalles del Componente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
