/**
 * useMaintenanceComponent Hook
 *
 * Fetches maintenance component data for work order pre-filling.
 * Only active when PREDICTIVE_MAINTENANCE feature is enabled.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - SWR for caching and revalidation
 * - Clean API with proper error handling
 * - Under 150 lines
 */

import useSWR from 'swr'
import { useCompanyFeatures } from '@/hooks/useCompanyFeatures'

interface MaintenanceComponent {
  id: string
  name: string
  partNumber: string | null
  description: string | null
  criticality: 'A' | 'B' | 'C' | null
  mtbf: number | null
  mttr: number | null
  lifeExpectancy: number | null
  inventoryItemId: string | null
}

interface UseMaintenanceComponentOptions {
  componentId?: string | null
  enabled?: boolean
}

interface UseMaintenanceComponentResult {
  component: MaintenanceComponent | null
  isLoading: boolean
  error: string | null
  isFeatureEnabled: boolean
}

const fetcher = async (url: string): Promise<MaintenanceComponent> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch component')
  }
  return response.json()
}

/**
 * Hook to fetch maintenance component data for work order creation
 */
export function useMaintenanceComponent(
  options: UseMaintenanceComponentOptions = {}
): UseMaintenanceComponentResult {
  const { componentId, enabled = true } = options
  const { hasPredictiveMaintenance } = useCompanyFeatures()

  // Build fetch URL only if feature is enabled and componentId is provided
  const shouldFetch = hasPredictiveMaintenance && enabled && componentId
  const url = shouldFetch ? `/api/exploded-view-components/${componentId}` : null

  const { data, error: swrError, isLoading } = useSWR<MaintenanceComponent>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      onError: (err) => {
        console.error('Error fetching maintenance component:', err)
      },
    }
  )

  return {
    component: data ?? null,
    isLoading,
    error: swrError?.message ?? null,
    isFeatureEnabled: hasPredictiveMaintenance,
  }
}

/**
 * Helper to generate work order title from component
 */
export function generateMaintenanceWorkOrderTitle(
  component: MaintenanceComponent
): string {
  const prefix = 'Mantenimiento Predictivo'
  const componentName = component.name
  const partNumber = component.partNumber ? ` (${component.partNumber})` : ''

  return `${prefix}: ${componentName}${partNumber}`
}

/**
 * Helper to generate work order description from component
 */
export function generateMaintenanceWorkOrderDescription(
  component: MaintenanceComponent
): string {
  const parts: string[] = []

  if (component.description) {
    parts.push(component.description)
  }

  if (component.criticality) {
    const criticalityLabels = {
      A: 'Componente crítico (A)',
      B: 'Componente importante (B)',
      C: 'Componente normal (C)',
    }
    parts.push(`\nCriticidad: ${criticalityLabels[component.criticality]}`)
  }

  if (component.mtbf) {
    parts.push(`MTBF: ${component.mtbf} horas`)
  }

  if (component.lifeExpectancy) {
    parts.push(`Vida útil: ${component.lifeExpectancy} horas`)
  }

  parts.push('\n⚠️ Orden de trabajo generada automáticamente por alerta de mantenimiento predictivo.')

  return parts.join('\n')
}

/**
 * Helper to determine work order priority from component criticality
 */
export function getMaintenancePriority(
  criticality: 'A' | 'B' | 'C' | null
): 'URGENT' | 'HIGH' | 'MEDIUM' {
  if (!criticality) return 'MEDIUM'

  const priorityMap = {
    A: 'URGENT' as const,
    B: 'HIGH' as const,
    C: 'MEDIUM' as const,
  }

  return priorityMap[criticality]
}
