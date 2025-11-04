/**
 * AI Configuration Repository
 *
 * Database operations for managing company AI configurations
 */

import { prisma } from "@/lib/prisma"

export interface AIConfigUpdate {
  monthlyTokenLimit?: number
  alertThresholdPercent?: number
  insightsEnabled?: boolean
  reportsEnabled?: boolean
  predictiveEnabled?: boolean
  currentMonthTokens?: number
  lastResetAt?: Date
}

export interface AIUsageStats {
  totalCalls: number
  totalTokens: number
  totalCost: number
  successfulCalls: number
  failedCalls: number
}

export class AIConfigRepository {
  /**
   * Get AI config for a company
   */
  static async getCompanyAIConfig(companyId: string) {
    return await prisma.companyAIConfig.findUnique({
      where: { companyId }
    })
  }

  /**
   * Create default AI config for a company
   */
  static async createDefaultAIConfig(companyId: string) {
    return await prisma.companyAIConfig.create({
      data: {
        companyId,
        monthlyTokenLimit: 100000, // 100k tokens default
        alertThresholdPercent: 80,
        currentMonthTokens: 0,
        insightsEnabled: true,
        reportsEnabled: true,
        predictiveEnabled: false
      }
    })
  }

  /**
   * Get or create AI config for a company
   */
  static async getOrCreateAIConfig(companyId: string) {
    let config = await this.getCompanyAIConfig(companyId)

    if (!config) {
      config = await this.createDefaultAIConfig(companyId)
    }

    return config
  }

  /**
   * Update AI config for a company
   */
  static async updateAIConfig(companyId: string, data: AIConfigUpdate) {
    return await prisma.companyAIConfig.upsert({
      where: { companyId },
      update: data,
      create: {
        companyId,
        monthlyTokenLimit: data.monthlyTokenLimit || 100000,
        alertThresholdPercent: data.alertThresholdPercent || 80,
        currentMonthTokens: data.currentMonthTokens || 0,
        insightsEnabled: data.insightsEnabled ?? true,
        reportsEnabled: data.reportsEnabled ?? true,
        predictiveEnabled: data.predictiveEnabled ?? false
      }
    })
  }

  /**
   * Reset monthly tokens for a company
   */
  static async resetMonthlyTokens(companyId: string) {
    return await prisma.companyAIConfig.update({
      where: { companyId },
      data: {
        currentMonthTokens: 0,
        lastResetAt: new Date()
      }
    })
  }

  /**
   * Get monthly usage statistics for a company
   */
  static async getMonthlyUsageStats(companyId: string): Promise<AIUsageStats> {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const monthlyLogs = await prisma.aIUsageLog.findMany({
      where: {
        companyId,
        createdAt: { gte: startOfMonth }
      },
      select: {
        totalTokens: true,
        cost: true,
        success: true
      }
    })

    return {
      totalCalls: monthlyLogs.length,
      totalTokens: monthlyLogs.reduce((sum, log) => sum + log.totalTokens, 0),
      totalCost: monthlyLogs.reduce((sum, log) => sum + (log.cost || 0), 0),
      successfulCalls: monthlyLogs.filter(log => log.success).length,
      failedCalls: monthlyLogs.filter(log => !log.success).length
    }
  }

  /**
   * Get recent AI usage logs for a company
   */
  static async getRecentUsageLogs(companyId: string, limit: number = 10) {
    return await prisma.aIUsageLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  /**
   * Get all companies with AI config
   */
  static async getAllCompaniesWithAIConfig() {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        subdomain: true,
        tier: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    })

    // Get AI config for each company
    const companiesWithConfig = await Promise.all(
      companies.map(async (company) => {
        const aiConfig = await this.getCompanyAIConfig(company.id)
        const monthlyStats = aiConfig
          ? await this.getMonthlyUsageStats(company.id)
          : null

        return {
          ...company,
          aiConfig,
          monthlyStats
        }
      })
    )

    return companiesWithConfig
  }
}
