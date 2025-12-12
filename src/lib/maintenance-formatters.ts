/**
 * Maintenance Formatters
 *
 * Utility functions for formatting maintenance-related data
 * Following Next.js Expert standards: pure functions, type-safe
 */

import type { ComponentCriticality, FrequencyUnit } from '@prisma/client'

/**
 * Get criticality badge variant
 */
export function getCriticalityVariant(
  criticality: ComponentCriticality | null
): 'destructive' | 'default' | 'secondary' {
  if (!criticality) return 'secondary'

  const variants = {
    A: 'destructive' as const,
    B: 'default' as const,
    C: 'secondary' as const,
  }

  return variants[criticality]
}

/**
 * Get criticality label
 */
export function getCriticalityLabel(criticality: ComponentCriticality | null): string {
  if (!criticality) return 'Sin clasificar'

  const labels = {
    A: 'A - Crítico',
    B: 'B - Importante',
    C: 'C - Normal',
  }

  return labels[criticality]
}

/**
 * Format hours to display
 */
export function formatHours(hours: number | null): string {
  if (!hours) return 'N/A'
  return `${hours.toLocaleString()} horas`
}

/**
 * Format maintenance interval
 */
export function formatMaintenanceInterval(
  interval: number | null,
  unit: FrequencyUnit | null
): string {
  if (!interval || !unit) return 'N/A'

  const unitLabels: Record<FrequencyUnit, string> = {
    HOURS: interval === 1 ? 'hora' : 'horas',
    DAYS: interval === 1 ? 'día' : 'días',
    WEEKS: interval === 1 ? 'semana' : 'semanas',
    MONTHS: interval === 1 ? 'mes' : 'meses',
    YEARS: interval === 1 ? 'año' : 'años',
  }

  return `Cada ${interval} ${unitLabels[unit]}`
}

/**
 * Format next maintenance date
 */
export function formatNextMaintenance(dateString: string | null): string {
  if (!dateString) return 'Por programar'

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Vencido'
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays <= 7) return `En ${diffDays} días`

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
