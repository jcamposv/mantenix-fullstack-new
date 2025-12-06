/**
 * Stock Calculator Utility
 *
 * Calculates optimal stock levels based on component criticality,
 * MTBF (Mean Time Between Failures), and lead times.
 * Follows ISO 14224 standards for maintenance inventory management.
 *
 * @module lib/inventory/stock-calculator
 */

import type { ComponentCriticality } from '@prisma/client'

/**
 * Input parameters for stock calculation
 */
export interface StockCalculationParams {
  criticality: ComponentCriticality | null
  mtbf: number | null // Mean Time Between Failures (hours)
  mttr: number | null // Mean Time To Repair (hours)
  leadTime: number // Lead time in days
  currentStock: number
  safetyStockMultiplier?: number // Default: 1.5
}

/**
 * Result of stock calculation
 */
export interface StockCalculationResult {
  minimumStock: number
  reorderPoint: number
  safetyStock: number
  recommendedStock: number
  monthlyConsumption: number
  criticalityFactor: number
}

/**
 * Criticality factors according to ISO 14224
 * A = Critical (failure causes total shutdown)
 * B = Important (failure causes performance degradation)
 * C = Minor (failure has minimal operational impact)
 */
const CRITICALITY_FACTORS: Record<ComponentCriticality, number> = {
  A: 3, // Critical: 3x safety factor
  B: 2, // Important: 2x safety factor
  C: 1, // Minor: 1x safety factor
}

/**
 * Calculate minimum stock based on criticality and MTBF
 *
 * Formula:
 * - Monthly Consumption = (30 days × 24 hours) / MTBF
 * - Criticality Factor = Based on component criticality (A=3, B=2, C=1)
 * - Lead Time Buffer = Days to receive new stock
 * - Min Stock = Criticality Factor × Monthly Consumption × Lead Time Buffer
 *
 * @param params - Stock calculation parameters
 * @returns Calculated stock levels
 */
export function calculateMinimumStock(
  params: StockCalculationParams
): StockCalculationResult {
  const {
    criticality,
    mtbf,
    leadTime,
    safetyStockMultiplier = 1.5,
  } = params

  // Determine criticality factor (default to C if not set)
  const criticalityFactor = criticality
    ? CRITICALITY_FACTORS[criticality]
    : CRITICALITY_FACTORS.C

  // Calculate average monthly consumption based on MTBF
  // If MTBF is not available, assume 1 failure per month
  const monthlyConsumption = mtbf
    ? Math.ceil((30 * 24) / mtbf) // failures per month
    : 1

  // Lead time buffer in months (minimum 1 month)
  const leadTimeBuffer = Math.max(1, Math.ceil(leadTime / 30))

  // Minimum stock = criticality factor × monthly consumption × lead time
  const minimumStock = Math.ceil(
    criticalityFactor * monthlyConsumption * leadTimeBuffer
  )

  // Safety stock = minimum stock × safety multiplier
  const safetyStock = Math.ceil(minimumStock * safetyStockMultiplier)

  // Reorder point = average usage during lead time + safety stock
  const usageDuringLeadTime = Math.ceil(
    monthlyConsumption * (leadTime / 30)
  )
  const reorderPoint = usageDuringLeadTime + safetyStock

  // Recommended stock = reorder point + minimum stock
  const recommendedStock = reorderPoint + minimumStock

  return {
    minimumStock,
    reorderPoint,
    safetyStock,
    recommendedStock,
    monthlyConsumption,
    criticalityFactor,
  }
}

/**
 * Check if current stock is below minimum threshold
 */
export function isStockBelowMinimum(
  currentStock: number,
  minimumStock: number
): boolean {
  return currentStock < minimumStock
}

/**
 * Check if current stock is at or below reorder point
 */
export function shouldReorder(
  currentStock: number,
  reorderPoint: number
): boolean {
  return currentStock <= reorderPoint
}

/**
 * Calculate stock status level
 */
export type StockStatus = 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK'

export function getStockStatus(
  currentStock: number,
  minimumStock: number,
  reorderPoint: number
): StockStatus {
  if (currentStock === 0) return 'OUT_OF_STOCK'
  if (currentStock < minimumStock * 0.25) return 'CRITICAL'
  if (currentStock < minimumStock) return 'LOW'
  return 'HEALTHY'
}

/**
 * Format stock calculation for display
 */
export function formatStockCalculation(
  result: StockCalculationResult
): string {
  return [
    `Consumo Mensual: ${result.monthlyConsumption} unidades`,
    `Factor de Criticidad: ${result.criticalityFactor}x`,
    `Stock Mínimo: ${result.minimumStock}`,
    `Punto de Reorden: ${result.reorderPoint}`,
    `Stock de Seguridad: ${result.safetyStock}`,
    `Stock Recomendado: ${result.recommendedStock}`,
  ].join('\n')
}
