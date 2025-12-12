/**
 * Safety Briefing Types
 * Type definitions for safety briefing with digital signature
 */

import type { Prisma } from "@prisma/client"

/**
 * SafetyBriefing with full relations
 */
export type SafetyBriefingWithRelations = Prisma.SafetyBriefingGetPayload<{
  include: {
    workOrder: {
      select: {
        id: true
        number: true
        title: true
        status: true
      }
    }
    user: {
      select: {
        id: true
        name: true
        email: true
      }
    }
  }
}>

/**
 * SafetyBriefing creation data
 */
export interface SafetyBriefingCreateData {
  workOrderId: string
  userId: string
  confirmedWorkPermits: boolean
  confirmedLOTO: boolean
  confirmedJSA: boolean
  signature?: string
}

/**
 * SafetyBriefing filters
 */
export interface SafetyBriefingFilters {
  workOrderId?: string
  userId?: string
  fromDate?: Date
  toDate?: Date
}
