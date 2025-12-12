/**
 * Maintenance Analytics Dashboard Page
 *
 * Server Component that checks feature flag and renders analytics dashboard.
 * Following Next.js Expert standards:
 * - Server Component for feature check
 * - Client components for interactivity
 * - Feature flag gated
 */

import { redirect } from 'next/navigation'
import { getCurrentUserWithRole } from '@/lib/auth-utils'
import { FeatureService } from '@/server/services/feature.service'
import { AnalyticsDashboard } from '@/components/maintenance/analytics-dashboard'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const metadata = {
  title: 'Analytics de Mantenimiento | Mantenix',
  description: 'Dashboard de métricas y tendencias de mantenimiento predictivo',
}

/**
 * Main Analytics Page
 */
export default async function MaintenanceAnalyticsPage() {
  // Check authentication
  const user = await getCurrentUserWithRole()

  if (!user) {
    redirect('/login')
  }

  const companyId = user.companyId || user.company?.id

  if (!companyId) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo determinar la empresa del usuario.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check feature flag
  const hasPredictiveMaintenance = await FeatureService.isModuleEnabled(
    companyId,
    'PREDICTIVE_MAINTENANCE'
  )

  if (!hasPredictiveMaintenance) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature no disponible</AlertTitle>
          <AlertDescription>
            El módulo de Mantenimiento Predictivo no está activo para su empresa.
            Contacte al administrador para activarlo.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Render dashboard
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics de Mantenimiento</h1>
        <p className="text-muted-foreground">
          Métricas y tendencias del sistema de mantenimiento predictivo
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
