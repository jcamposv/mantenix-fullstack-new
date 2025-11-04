/**
 * AI Usage Repository
 *
 * Handles all database operations for AI usage tracking and configuration
 * Following Repository pattern - only contains direct Prisma operations
 */

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import type { AIOperationType } from "@/server/services/openai.service"

export class AIUsageRepository {
  /**
   * Get AI configuration for a company
   */
  static async getCompanyAIConfig(companyId: string) {
    return await prisma.companyAIConfig.findUnique({
      where: { companyId },
    })
  }

  /**
   * Create AI configuration for a company
   */
  static async createCompanyAIConfig(data: Prisma.CompanyAIConfigCreateInput) {
    return await prisma.companyAIConfig.create({
      data,
    })
  }

  /**
   * Update AI configuration for a company
   */
  static async updateCompanyAIConfig(
    companyId: string,
    data: Prisma.CompanyAIConfigUpdateInput
  ) {
    return await prisma.companyAIConfig.update({
      where: { companyId },
      data,
    })
  }

  /**
   * Upsert AI configuration (create if not exists, update if exists)
   */
  static async upsertCompanyAIConfig(
    companyId: string,
    data: Omit<Prisma.CompanyAIConfigCreateInput, 'company'>,
    update: Prisma.CompanyAIConfigUpdateInput
  ) {
    return await prisma.companyAIConfig.upsert({
      where: { companyId },
      create: {
        ...data,
        company: {
          connect: { id: companyId }
        }
      },
      update,
    })
  }

  /**
   * Increment token usage for a company
   */
  static async incrementTokenUsage(companyId: string, tokens: number) {
    return await prisma.companyAIConfig.update({
      where: { companyId },
      data: {
        currentMonthTokens: {
          increment: tokens
        }
      }
    })
  }

  /**
   * Reset monthly token counter
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
   * Create an AI usage log entry
   */
  static async createUsageLog(data: Prisma.AIUsageLogCreateInput) {
    return await prisma.aIUsageLog.create({
      data,
    })
  }

  /**
   * Get usage logs for a company with filters
   */
  static async getUsageLogs(
    companyId: string,
    options?: {
      startDate?: Date
      endDate?: Date
      operation?: string
      userId?: string
      limit?: number
    }
  ) {
    const where: Prisma.AIUsageLogWhereInput = {
      companyId,
      ...(options?.startDate && {
        createdAt: {
          gte: options.startDate,
          ...(options?.endDate && { lte: options.endDate })
        }
      }),
      ...(options?.operation && { operation: options.operation as AIOperationType }),
      ...(options?.userId && { userId: options.userId })
    }

    return await prisma.aIUsageLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: options?.limit || 100,
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
   * Get token usage statistics for a company (current month)
   */
  static async getMonthlyUsageStats(companyId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const logs = await prisma.aIUsageLog.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        operation: true,
        totalTokens: true,
        cost: true,
        success: true
      }
    })

    // Calculate aggregated stats
    const totalTokens = logs.reduce((sum: number, log) => sum + log.totalTokens, 0)
    const totalCost = logs.reduce((sum: number, log) => sum + (log.cost || 0), 0)
    const totalRequests = logs.length
    const successfulRequests = logs.filter((log) => log.success).length
    const failedRequests = totalRequests - successfulRequests

    // Group by operation
    const byOperation = logs.reduce((acc: Record<string, { count: number; tokens: number; cost: number }>, log) => {
      const op = log.operation
      if (!acc[op]) {
        acc[op] = { count: 0, tokens: 0, cost: 0 }
      }
      acc[op].count++
      acc[op].tokens += log.totalTokens
      acc[op].cost += log.cost || 0
      return acc
    }, {} as Record<string, { count: number; tokens: number; cost: number }>)

    return {
      totalTokens,
      totalCost,
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      byOperation
    }
  }

  /**
   * Check if company has AI feature enabled
   */
  static async hasAIFeatureEnabled(companyId: string): Promise<boolean> {
    console.log('[AIUsageRepository] Checking AI feature for companyId:', companyId)
    const feature = await prisma.companyFeature.findUnique({
      where: {
        companyId_module: {
          companyId,
          module: 'AI_ASSISTANT'
        }
      },
      select: {
        isEnabled: true
      }
    })
    console.log('[AIUsageRepository] Feature found:', feature)

    const isEnabled = feature?.isEnabled || false
    console.log('[AIUsageRepository] AI feature enabled:', isEnabled)
    return isEnabled
  }

  /**
   * Check if company is within token limit
   */
  static async isWithinTokenLimit(companyId: string): Promise<{
    withinLimit: boolean
    currentTokens: number
    limit: number
    percentageUsed: number
  }> {
    const config = await this.getCompanyAIConfig(companyId)

    if (!config) {
      return {
        withinLimit: false,
        currentTokens: 0,
        limit: 0,
        percentageUsed: 0
      }
    }

    const percentageUsed = (config.currentMonthTokens / config.monthlyTokenLimit) * 100

    return {
      withinLimit: config.currentMonthTokens < config.monthlyTokenLimit,
      currentTokens: config.currentMonthTokens,
      limit: config.monthlyTokenLimit,
      percentageUsed: Math.round(percentageUsed * 100) / 100
    }
  }
}
