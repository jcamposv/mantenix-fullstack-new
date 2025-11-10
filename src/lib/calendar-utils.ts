/**
 * Calendar utility functions
 * Shared helpers for all calendar components
 */

import type { WorkOrderStatus, RecurrenceType } from './calendar-constants';

/**
 * Get color by work order status
 * Returns hex color code for the given status
 *
 * @param status - Work order status
 * @returns Hex color code
 */
export function getColorByStatus(status: WorkOrderStatus | string): string {
  const colorMap: Record<WorkOrderStatus, string> = {
    OPEN: '#ef4444', // red
    IN_PROGRESS: '#eab308', // yellow
    UNDER_REVIEW: '#3b82f6', // blue
    COMPLETED: '#22c55e', // green
    CANCELLED: '#6b7280', // gray
  };
  return colorMap[status as WorkOrderStatus] ?? '#6b7280';
}

/**
 * Get darker color by work order status (for schedule calendar)
 * Returns darker hex color code for better contrast
 *
 * @param status - Work order status
 * @returns Hex color code (darker variant)
 */
export function getDarkerColorByStatus(status: WorkOrderStatus | string): string {
  const colorMap: Record<WorkOrderStatus, string> = {
    OPEN: '#dc2626', // red-600
    IN_PROGRESS: '#ca8a04', // yellow-600
    UNDER_REVIEW: '#2563eb', // blue-600
    COMPLETED: '#16a34a', // green-600
    CANCELLED: '#52525b', // zinc-600
  };
  return colorMap[status as WorkOrderStatus] ?? '#52525b';
}

/**
 * Get color by recurrence type
 * Returns hex color code for schedule recurrence type
 *
 * @param recurrenceType - Schedule recurrence type
 * @returns Hex color code
 */
export function getColorByRecurrenceType(recurrenceType: RecurrenceType | string): string {
  const colorMap: Record<RecurrenceType, string> = {
    DAILY: '#3b82f6', // blue
    WEEKLY: '#10b981', // green
    MONTHLY: '#f59e0b', // amber
    YEARLY: '#8b5cf6', // purple
    METER_BASED: '#ef4444', // red
  };
  return colorMap[recurrenceType as RecurrenceType] ?? '#6b7280'; // gray as default
}

/**
 * Get human-readable status label
 * Translates status enum to Spanish label
 *
 * @param status - Work order status
 * @returns Translated status label in Spanish
 */
export function getStatusLabel(status: WorkOrderStatus | string): string {
  const labels: Record<WorkOrderStatus, string> = {
    OPEN: 'Abierta',
    IN_PROGRESS: 'En Progreso',
    UNDER_REVIEW: 'En Revisión',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  };
  return labels[status as WorkOrderStatus] ?? status;
}

/**
 * Get human-readable recurrence type label
 * Translates recurrence type enum to Spanish label
 *
 * @param recurrenceType - Schedule recurrence type
 * @returns Translated recurrence type label in Spanish
 */
export function getRecurrenceTypeLabel(recurrenceType: RecurrenceType | string): string {
  const labels: Record<RecurrenceType, string> = {
    DAILY: 'Diario',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    YEARLY: 'Anual',
    METER_BASED: 'Basado en Medidores',
  };
  return labels[recurrenceType as RecurrenceType] ?? recurrenceType;
}

/**
 * Format date for display
 * Returns date in Spanish long format (e.g., "15 de enero de 2025")
 *
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date string in Spanish
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date and time for display
 * Returns date and time in Spanish long format (e.g., "15 de enero de 2025, 14:30")
 *
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date-time string in Spanish
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
