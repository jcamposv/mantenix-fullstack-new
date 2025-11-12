/**
 * Time Tracking Types
 *
 * Types for work order time tracking system
 * Follows CMMS best practices for precise MTTR calculation
 */

import type { TimeLogAction, PauseReason } from "@prisma/client"

/**
 * Work Order Time Log
 * Registro individual de una acción de tiempo en una orden de trabajo
 */
export interface WorkOrderTimeLog {
  id: string
  workOrderId: string
  action: TimeLogAction
  pauseReason: PauseReason | null
  timestamp: Date
  userId: string
  latitude: number | null
  longitude: number | null
  segmentDurationMinutes: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Work Order Time Log with User
 * Incluye información del usuario que realizó la acción
 */
export interface WorkOrderTimeLogWithUser extends WorkOrderTimeLog {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

/**
 * Time Log Summary
 * Resumen de tiempo acumulado para una orden de trabajo
 */
export interface TimeLogSummary {
  workOrderId: string
  totalElapsedMinutes: number // Tiempo total transcurrido
  activeWorkMinutes: number // Tiempo activo de trabajo
  pausedMinutes: number // Tiempo en pausa
  currentStatus: "WORKING" | "PAUSED" | "NOT_STARTED" | "COMPLETED"
  lastAction: TimeLogAction | null
  lastActionTimestamp: Date | null
  pauseBreakdown: Array<{
    reason: PauseReason
    minutes: number
  }>
}

/**
 * Time Tracker State
 * Estado actual del timer para una orden de trabajo
 */
export interface TimeTrackerState {
  isTracking: boolean
  isPaused: boolean
  startTime: Date | null
  lastPauseTime: Date | null
  elapsedSeconds: number
  activeSeconds: number
  pausedSeconds: number
}

/**
 * Geolocation Coordinates
 * Coordenadas de geolocalización
 */
export interface GeolocationCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

/**
 * Time Log Action Request
 * Datos para crear un nuevo registro de tiempo
 */
export interface TimeLogActionRequest {
  workOrderId: string
  action: TimeLogAction
  pauseReason?: PauseReason
  notes?: string
  location?: GeolocationCoordinates
}

/**
 * Time Breakdown
 * Desglose detallado de tiempo para reportes
 */
export interface TimeBreakdown {
  diagnostic: number // Tiempo de diagnóstico
  activeWork: number // Trabajo activo
  waitingParts: number // Esperando repuestos
  travel: number // Viaje/traslado
  breaks: number // Descansos
  other: number // Otros
}

/**
 * Work Order Time Metrics
 * Métricas de tiempo para una orden de trabajo
 */
export interface WorkOrderTimeMetrics {
  workOrderId: string
  estimatedDuration: number | null
  actualDuration: number | null // Total elapsed
  activeWorkTime: number | null // Tiempo activo real
  waitingTime: number | null // Tiempo de espera
  diagnosticTime: number | null // Tiempo de diagnóstico
  travelTime: number | null // Tiempo de viaje
  efficiency: number | null // activeWorkTime / actualDuration * 100
  variance: number | null // actualDuration - estimatedDuration
}
