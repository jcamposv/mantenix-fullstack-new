/**
 * Safety Briefing Service
 * Business logic for safety briefing management with digital signature
 */

import { Prisma } from "@prisma/client"
import { SafetyBriefingRepository } from "../repositories/safety-briefing.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  SafetyBriefingWithRelations,
  SafetyBriefingCreateData
} from "@/types/safety-briefing.types"

export class SafetyBriefingService {
  /**
   * Create or update safety briefing
   * If briefing exists for user+workOrder, update it; otherwise create new
   */
  static async createOrUpdate(
    data: SafetyBriefingCreateData,
    session: AuthenticatedSession
  ): Promise<SafetyBriefingWithRelations> {
    // Check if briefing already exists
    const existing = await SafetyBriefingRepository.findByWorkOrderAndUser(
      data.workOrderId,
      data.userId
    )

    const briefingData = {
      confirmedWorkPermits: data.confirmedWorkPermits,
      confirmedLOTO: data.confirmedLOTO,
      confirmedJSA: data.confirmedJSA,
      signature: data.signature || null,
      confirmedAt: new Date()
    }

    if (existing) {
      // Update existing briefing
      return await SafetyBriefingRepository.update(existing.id, briefingData)
    } else {
      // Create new briefing
      const createData: Prisma.SafetyBriefingCreateInput = {
        workOrder: { connect: { id: data.workOrderId } },
        user: { connect: { id: data.userId } },
        ...briefingData
      }
      return await SafetyBriefingRepository.create(createData)
    }
  }

  /**
   * Get briefing for a work order and user
   */
  static async getByWorkOrderAndUser(
    workOrderId: string,
    userId: string,
    session: AuthenticatedSession
  ): Promise<SafetyBriefingWithRelations | null> {
    return await SafetyBriefingRepository.findByWorkOrderAndUser(
      workOrderId,
      userId
    )
  }

  /**
   * Get all briefings for a work order
   */
  static async getByWorkOrder(
    workOrderId: string,
    session: AuthenticatedSession
  ): Promise<SafetyBriefingWithRelations[]> {
    await PermissionGuard.require(session, 'safety.view_permits')
    return await SafetyBriefingRepository.findByWorkOrder(workOrderId)
  }

  /**
   * Get user's safety briefing history
   */
  static async getUserHistory(
    userId: string,
    session: AuthenticatedSession,
    fromDate?: Date,
    toDate?: Date
  ): Promise<SafetyBriefingWithRelations[]> {
    // Users can only view their own history, unless they have permission
    if (session.user.id !== userId) {
      await PermissionGuard.require(session, 'safety.view_permits')
    }

    return await SafetyBriefingRepository.findByUser(userId, fromDate, toDate)
  }

  /**
   * Check if user has confirmed safety documents for a work order
   */
  static async hasUserConfirmed(
    workOrderId: string,
    userId: string
  ): Promise<boolean> {
    return await SafetyBriefingRepository.hasUserConfirmed(workOrderId, userId)
  }

  /**
   * Delete briefing (admin only)
   */
  static async delete(
    id: string,
    session: AuthenticatedSession
  ): Promise<void> {
    await PermissionGuard.require(session, 'safety.manage_permits')
    await SafetyBriefingRepository.delete(id)
  }
}
