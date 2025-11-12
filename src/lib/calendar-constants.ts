/**
 * Calendar constants and type definitions
 * Centralized configuration for all calendar components
 */

// ============================================
// Types
// ============================================

export interface LegendItem {
  color: string;
  label: string;
  value: string;
}

export type WorkOrderStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export type RecurrenceType =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'METER_BASED';

// ============================================
// Work Order Status Legend
// ============================================

export const WORK_ORDER_STATUS_LEGEND: readonly LegendItem[] = [
  { color: 'bg-red-500', label: 'Abierta', value: 'OPEN' },
  { color: 'bg-yellow-500', label: 'En Progreso', value: 'IN_PROGRESS' },
  { color: 'bg-blue-500', label: 'En Revisión', value: 'UNDER_REVIEW' },
  { color: 'bg-green-500', label: 'Completada', value: 'COMPLETED' },
  { color: 'bg-gray-500', label: 'Cancelada', value: 'CANCELLED' },
] as const;

// ============================================
// Work Order Status Legend (Darker for schedule)
// ============================================

export const WORK_ORDER_STATUS_LEGEND_DARK: readonly LegendItem[] = [
  { color: 'bg-red-600', label: 'Abierta', value: 'OPEN' },
  { color: 'bg-yellow-600', label: 'En Progreso', value: 'IN_PROGRESS' },
  { color: 'bg-blue-600', label: 'En Revisión', value: 'UNDER_REVIEW' },
  { color: 'bg-green-600', label: 'Completada', value: 'COMPLETED' },
  { color: 'bg-zinc-600', label: 'Cancelada', value: 'CANCELLED' },
] as const;

// ============================================
// Recurrence Type Legend
// ============================================

export const RECURRENCE_TYPE_LEGEND: readonly LegendItem[] = [
  { color: 'bg-blue-500', label: 'Diario', value: 'DAILY' },
  { color: 'bg-green-500', label: 'Semanal', value: 'WEEKLY' },
  { color: 'bg-amber-500', label: 'Mensual', value: 'MONTHLY' },
  { color: 'bg-purple-500', label: 'Anual', value: 'YEARLY' },
  { color: 'bg-red-500', label: 'Basado en Medidores', value: 'METER_BASED' },
] as const;
