/**
 * Subscription Guard Middleware
 * Validates subscription limits before allowing operations
 */

import { SubscriptionService } from "@/server/services/subscription.service"
import type { LimitType } from "@/types/subscription.types"

export class SubscriptionGuard {
  /**
   * Validates if an operation can proceed based on subscription limits
   * Throws an error if the limit would be exceeded and overage is not allowed
   */
  static async validateLimit(
    companyId: string,
    limitType: LimitType,
    incrementAmount: number = 1
  ): Promise<void> {
    const result = await SubscriptionService.validateLimit(
      companyId,
      limitType,
      incrementAmount
    )

    if (!result.canProceed) {
      throw new Error(result.reason ?? "Límite de subscripción excedido")
    }

    // If requires overage payment, log a warning but allow (will be charged later)
    if (result.requiresOveragePayment) {
      console.warn(
        `[SubscriptionGuard] Overage detected for ${limitType} in company ${companyId}. ` +
        `Additional charge: $${result.overagePrice}`
      )
    }
  }

  /**
   * Validates user creation limit
   * Use this before creating a new user
   */
  static async validateUserCreation(companyId: string): Promise<void> {
    await this.validateLimit(companyId, "users", 1)
  }

  /**
   * Validates work order creation limit
   * Use this before creating a new work order
   */
  static async validateWorkOrderCreation(companyId: string): Promise<void> {
    await this.validateLimit(companyId, "workOrders", 1)
  }

  /**
   * Validates inventory item creation limit
   * Use this before creating a new inventory item
   */
  static async validateInventoryItemCreation(companyId: string): Promise<void> {
    await this.validateLimit(companyId, "inventoryItems", 1)
  }

  /**
   * Validates storage limit
   * Use this before uploading files
   */
  static async validateStorageUpload(
    companyId: string,
    fileSizeGB: number
  ): Promise<void> {
    await this.validateLimit(companyId, "storage", fileSizeGB)
  }

  /**
   * Validates company creation limit
   * Use this before creating a new company (for multi-company features)
   */
  static async validateCompanyCreation(companyId: string): Promise<void> {
    await this.validateLimit(companyId, "companies", 1)
  }

  /**
   * Validates warehouse creation limit
   * Use this before creating a new warehouse/location
   */
  static async validateWarehouseCreation(companyId: string): Promise<void> {
    await this.validateLimit(companyId, "warehouses", 1)
  }

  /**
   * Check if a company has an active subscription
   * Returns true if active, false otherwise
   */
  static async hasActiveSubscription(companyId: string): Promise<boolean> {
    try {
      const subscription = await SubscriptionService.getCompanySubscription(companyId)
      return subscription?.status === "ACTIVE" || subscription?.status === "TRIALING"
    } catch {
      return false
    }
  }

  /**
   * Get usage summary for a company
   * Useful for displaying usage stats in UI
   */
  static async getUsageSummary(companyId: string) {
    const subscription = await SubscriptionService.getCompanySubscription(companyId)
    if (!subscription) {
      throw new Error("No hay subscripción activa para esta compañía")
    }
    return await SubscriptionService.getUsageSummary(subscription.id)
  }
}
