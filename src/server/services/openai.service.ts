/**
 * OpenAI Service
 *
 * Handles all interactions with OpenAI API
 * Includes automatic token tracking and cost calculation
 */

import OpenAI from "openai"
import { AIUsageRepository } from "@/server/repositories/ai-usage.repository"
import type { Prisma } from "@prisma/client"

// AI Operation Type enum (matches Prisma schema)
export type AIOperationType =
  | 'INSIGHTS_GENERATION'
  | 'REPORT_GENERATION'
  | 'ANOMALY_DETECTION'
  | 'PREDICTIVE_ANALYSIS'
  | 'RECOMMENDATION'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Pricing per 1K tokens (as of 2024 - update if needed)
const MODEL_PRICING = {
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4o": { input: 0.005, output: 0.015 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
} as const

type ModelType = keyof typeof MODEL_PRICING

interface GenerateCompletionOptions {
  companyId: string
  userId?: string
  operation: AIOperationType
  model?: ModelType
  systemPrompt?: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
  metadata?: Record<string, unknown>
}

interface CompletionResult {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost: number
  model: string
}

export class OpenAIService {
  /**
   * Generate a completion with automatic tracking
   */
  static async generateCompletion(
    options: GenerateCompletionOptions
  ): Promise<CompletionResult> {
    const {
      companyId,
      userId,
      operation,
      model = "gpt-4o",
      systemPrompt = "You are a helpful assistant specialized in maintenance management and industrial engineering.",
      userPrompt,
      temperature = 0.7,
      maxTokens = 2000,
      metadata = {}
    } = options

    const startTime = Date.now()

    try {
      // 1. Check if AI feature is enabled
      const isEnabled = await AIUsageRepository.hasAIFeatureEnabled(companyId)
      if (!isEnabled) {
        throw new Error("AI feature is not enabled for this company")
      }

      // 2. Check token limits
      const limitCheck = await AIUsageRepository.isWithinTokenLimit(companyId)
      if (!limitCheck.withinLimit) {
        throw new Error(
          `Monthly token limit reached. Used: ${limitCheck.currentTokens}/${limitCheck.limit} tokens (${limitCheck.percentageUsed}%)`
        )
      }

      // 3. Make OpenAI API call
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
      })

      // 4. Extract response and usage
      const content = completion.choices[0]?.message?.content || ""
      const usage = completion.usage

      if (!usage) {
        throw new Error("No usage data returned from OpenAI")
      }

      const promptTokens = usage.prompt_tokens
      const completionTokens = usage.completion_tokens
      const totalTokens = usage.total_tokens

      // 5. Calculate cost
      const cost = this.calculateCost(model, promptTokens, completionTokens)

      // 6. Update token usage
      await AIUsageRepository.incrementTokenUsage(companyId, totalTokens)

      // 7. Log the usage
      const duration = Date.now() - startTime
      await this.logUsage({
        companyId,
        userId,
        operation,
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
        success: true,
        duration,
        metadata
      })

      return {
        content,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens
        },
        cost,
        model
      }

    } catch (error) {
      // Log failed attempt
      const duration = Date.now() - startTime
      await this.logUsage({
        companyId,
        userId,
        operation,
        model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        duration,
        metadata
      })

      throw error
    }
  }

  /**
   * Calculate cost based on model and token usage
   */
  private static calculateCost(
    model: ModelType,
    promptTokens: number,
    completionTokens: number
  ): number {
    const pricing = MODEL_PRICING[model]

    if (!pricing) {
      console.warn(`Unknown model pricing for ${model}, using gpt-4o pricing`)
      return this.calculateCost("gpt-4o", promptTokens, completionTokens)
    }

    const inputCost = (promptTokens / 1000) * pricing.input
    const outputCost = (completionTokens / 1000) * pricing.output

    return Number((inputCost + outputCost).toFixed(6))
  }

  /**
   * Log AI usage to database
   */
  private static async logUsage(data: {
    companyId: string
    userId?: string
    operation: AIOperationType
    model: string
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
    success: boolean
    errorMessage?: string
    duration: number
    metadata?: Record<string, unknown>
  }) {
    try {
      await AIUsageRepository.createUsageLog({
        company: { connect: { id: data.companyId } },
        ...(data.userId && { user: { connect: { id: data.userId } } }),
        operation: data.operation,
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        cost: data.cost,
        success: data.success,
        errorMessage: data.errorMessage,
        duration: data.duration,
        ...(data.metadata && { metadata: data.metadata as Prisma.InputJsonValue })
      })
    } catch (error) {
      console.error("Failed to log AI usage:", error)
      // Don't throw - logging failure shouldn't break the main flow
    }
  }

  /**
   * Check if company can use AI (feature enabled + within limits)
   */
  static async canUseAI(companyId: string): Promise<{
    canUse: boolean
    reason?: string
    limitInfo?: {
      currentTokens: number
      limit: number
      percentageUsed: number
    }
  }> {
    // Check if feature is enabled
    const isEnabled = await AIUsageRepository.hasAIFeatureEnabled(companyId)
    if (!isEnabled) {
      return {
        canUse: false,
        reason: "AI feature is not enabled for this company"
      }
    }

    // Check token limits
    const limitCheck = await AIUsageRepository.isWithinTokenLimit(companyId)
    if (!limitCheck.withinLimit) {
      return {
        canUse: false,
        reason: "Monthly token limit reached",
        limitInfo: {
          currentTokens: limitCheck.currentTokens,
          limit: limitCheck.limit,
          percentageUsed: limitCheck.percentageUsed
        }
      }
    }

    // Check if approaching limit (>90%)
    if (limitCheck.percentageUsed > 90) {
      return {
        canUse: true,
        reason: "Warning: Approaching token limit",
        limitInfo: {
          currentTokens: limitCheck.currentTokens,
          limit: limitCheck.limit,
          percentageUsed: limitCheck.percentageUsed
        }
      }
    }

    return {
      canUse: true,
      limitInfo: {
        currentTokens: limitCheck.currentTokens,
        limit: limitCheck.limit,
        percentageUsed: limitCheck.percentageUsed
      }
    }
  }

  /**
   * Get usage statistics for a company
   */
  static async getUsageStats(companyId: string) {
    return await AIUsageRepository.getMonthlyUsageStats(companyId)
  }
}
