/**
 * AI Configuration Service
 *
 * Business logic for managing company AI configurations
 */

import { AIConfigRepository, type AIConfigUpdate } from "@/server/repositories/ai-config.repository"

export interface AIConfigDetails {
  config: {
    id: string
    companyId: string
    monthlyTokenLimit: number
    alertThresholdPercent: number
    currentMonthTokens: number
    lastResetAt: Date
    insightsEnabled: boolean
    reportsEnabled: boolean
    predictiveEnabled: boolean
    createdAt: Date
    updatedAt: Date
  } | null
  monthlyStats: {
    totalCalls: number
    totalTokens: number
    totalCost: number
    successfulCalls: number
    failedCalls: number
  }
  percentageUsed: number
  warningThresholdReached: boolean
  limitReached: boolean
  daysUntilReset: number
}

export class AIConfigService {
  /**
   * Get complete AI configuration details for a company
   */
  static async getCompanyAIConfigDetails(companyId: string): Promise<AIConfigDetails> {
    // Get or create config
    const config = await AIConfigRepository.getOrCreateAIConfig(companyId)

    // Get monthly stats
    const monthlyStats = await AIConfigRepository.getMonthlyUsageStats(companyId)

    // Calculate metrics
    const percentageUsed = config.monthlyTokenLimit > 0
      ? (config.currentMonthTokens / config.monthlyTokenLimit) * 100
      : 0

    const warningThresholdReached = percentageUsed >= config.alertThresholdPercent
    const limitReached = config.currentMonthTokens >= config.monthlyTokenLimit

    // Calculate days until reset
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      config,
      monthlyStats,
      percentageUsed: Math.round(percentageUsed * 10) / 10,
      warningThresholdReached,
      limitReached,
      daysUntilReset
    }
  }

  /**
   * Update AI configuration for a company
   */
  static async updateCompanyAIConfig(
    companyId: string,
    updates: AIConfigUpdate
  ) {
    return await AIConfigRepository.updateAIConfig(companyId, updates)
  }

  /**
   * Reset monthly token counter for a company
   */
  static async resetMonthlyTokens(companyId: string) {
    return await AIConfigRepository.resetMonthlyTokens(companyId)
  }

  /**
   * Get recent usage logs for a company
   */
  static async getRecentUsageLogs(companyId: string, limit: number = 10) {
    return await AIConfigRepository.getRecentUsageLogs(companyId, limit)
  }

  /**
   * Get all companies with their AI configuration
   */
  static async getAllCompaniesAIConfig() {
    return await AIConfigRepository.getAllCompaniesWithAIConfig()
  }

  /**
   * Validate and sanitize configuration updates
   */
  static validateConfigUpdates(updates: Partial<AIConfigUpdate>): AIConfigUpdate {
    const validated: AIConfigUpdate = {}

    // Validate monthlyTokenLimit
    if (typeof updates.monthlyTokenLimit === 'number') {
      if (updates.monthlyTokenLimit < 1000) {
        throw new Error('Monthly token limit must be at least 1,000 tokens')
      }
      if (updates.monthlyTokenLimit > 10000000) {
        throw new Error('Monthly token limit cannot exceed 10,000,000 tokens')
      }
      validated.monthlyTokenLimit = Math.floor(updates.monthlyTokenLimit)
    }

    // Validate alertThresholdPercent
    if (typeof updates.alertThresholdPercent === 'number') {
      if (updates.alertThresholdPercent < 50 || updates.alertThresholdPercent > 99) {
        throw new Error('Alert threshold must be between 50% and 99%')
      }
      validated.alertThresholdPercent = Math.floor(updates.alertThresholdPercent)
    }

    // Validate boolean flags
    if (typeof updates.insightsEnabled === 'boolean') {
      validated.insightsEnabled = updates.insightsEnabled
    }
    if (typeof updates.reportsEnabled === 'boolean') {
      validated.reportsEnabled = updates.reportsEnabled
    }
    if (typeof updates.predictiveEnabled === 'boolean') {
      validated.predictiveEnabled = updates.predictiveEnabled
    }

    return validated
  }

  /**
   * Increase token limit by percentage (useful for upgrades)
   */
  static async increaseTokenLimit(companyId: string, percentageIncrease: number) {
    const config = await AIConfigRepository.getOrCreateAIConfig(companyId)
    const newLimit = Math.floor(config.monthlyTokenLimit * (1 + percentageIncrease / 100))

    return await AIConfigRepository.updateAIConfig(companyId, {
      monthlyTokenLimit: newLimit
    })
  }

  /**
   * Set predefined tier limits
   */
  static async setTierLimit(companyId: string, tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') {
    const tierLimits = {
      STARTER: 50000,      // 50k tokens/month
      PROFESSIONAL: 200000, // 200k tokens/month
      ENTERPRISE: 1000000   // 1M tokens/month
    }

    return await AIConfigRepository.updateAIConfig(companyId, {
      monthlyTokenLimit: tierLimits[tier]
    })
  }
}
