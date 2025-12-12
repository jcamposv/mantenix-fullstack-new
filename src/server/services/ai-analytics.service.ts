/**
 * AI Analytics Service
 *
 * Business logic for generating AI-powered insights and analytics
 * Specialized for maintenance management and industrial engineering
 */

import { OpenAIService } from "./openai.service"
import { 
  WorkOrderAnalyticsRepository, 
  type DateRange,
  type WorkOrderAnalytics,
  type SitePerformance,
  type TimeseriesData
} from "@/server/repositories/work-order-analytics.repository"

export interface AIInsight {
  type: 'trend' | 'alert' | 'recommendation' | 'prediction'
  title: string
  description: string
  severity?: 'info' | 'warning' | 'critical'
  impact?: 'low' | 'medium' | 'high'
  actionable?: boolean
}

export interface DashboardInsights {
  summary: string
  insights: AIInsight[]
  generatedAt: Date
  tokenUsage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost: number
}

export class AIAnalyticsService {
  /**
   * Generate AI insights for client dashboard
   */
  static async generateDashboardInsights(
    companyId: string,
    userId: string,
    dateRange?: DateRange
  ): Promise<DashboardInsights> {
    // 1. Gather analytics data
    const [analytics, sitePerformance, timeseries] = await Promise.all([
      WorkOrderAnalyticsRepository.getCompanyAnalytics(companyId, dateRange),
      WorkOrderAnalyticsRepository.getSitePerformance(companyId, dateRange),
      dateRange
        ? WorkOrderAnalyticsRepository.getTimeseriesData(companyId, dateRange)
        : Promise.resolve([])
    ])

    // 2. Build context for AI
    const context = this.buildAnalyticsContext(analytics, sitePerformance, timeseries, dateRange)

    // 3. Generate AI prompt
    const prompt = this.buildDashboardInsightsPrompt(context)

    // 4. Call OpenAI
    const result = await OpenAIService.generateCompletion({
      companyId,
      userId,
      operation: 'INSIGHTS_GENERATION',
      model: 'gpt-4o',
      systemPrompt: this.getSystemPromptForIndustrial(),
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: 1500,
      metadata: {
        dateRange,
        analyticsSnapshot: {
          total: analytics.total,
          overdueCount: analytics.overdueCount,
          slaCompliance: analytics.slaCompliance
        }
      }
    })

    // 5. Parse AI response into structured insights
    const insights = this.parseInsightsResponse(result.content)

    return {
      summary: insights.summary,
      insights: insights.items,
      generatedAt: new Date(),
      tokenUsage: result.usage,
      cost: result.cost
    }
  }

  /**
   * Generate insights for client admin (focused on provider performance)
   * @param providerCompanyId - The provider company ID to check AI features against
   * @param clientCompanyId - The client company ID to query data for
   */
  static async generateClientInsights(
    providerCompanyId: string,
    clientCompanyId: string,
    siteId: string | null,
    userId: string,
    dateRange?: DateRange
  ): Promise<DashboardInsights> {
    // Get client-specific analytics
    const analytics = await WorkOrderAnalyticsRepository.getClientAnalytics(
      clientCompanyId,
      siteId,
      dateRange
    )

    const context = this.buildClientAnalyticsContext(analytics, dateRange)
    const prompt = this.buildClientInsightsPrompt(context)

    // Use provider company ID for AI feature checks and billing
    const result = await OpenAIService.generateCompletion({
      companyId: providerCompanyId,
      userId,
      operation: 'INSIGHTS_GENERATION',
      model: 'gpt-4o',
      systemPrompt: this.getSystemPromptForClientAdmin(),
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: 1500,
      metadata: {
        providerCompanyId,
        clientCompanyId,
        siteId,
        dateRange
      }
    })

    const insights = this.parseInsightsResponse(result.content)

    return {
      summary: insights.summary,
      insights: insights.items,
      generatedAt: new Date(),
      tokenUsage: result.usage,
      cost: result.cost
    }
  }

  /**
   * Build analytics context for AI prompt
   */
  private static buildAnalyticsContext(
    analytics: WorkOrderAnalytics,
    sitePerformance: SitePerformance[],
    timeseries: TimeseriesData[],
    dateRange?: DateRange
  ): string {
    const periodText = dateRange
      ? `del ${dateRange.from.toLocaleDateString('es-ES')} al ${dateRange.to.toLocaleDateString('es-ES')}`
      : 'del período actual'

    let context = `# Análisis de Órdenes de Trabajo ${periodText}\n\n`

    // Overall stats
    context += `## Estadísticas Generales\n`
    context += `- Total de órdenes: ${analytics.total}\n`
    context += `- Órdenes completadas: ${analytics.byStatus.COMPLETED || 0} (${Math.round((analytics.byStatus.COMPLETED || 0) / analytics.total * 100)}%)\n`
    context += `- Órdenes en progreso: ${analytics.byStatus.IN_PROGRESS || 0}\n`
    context += `- Órdenes pendientes: ${analytics.byStatus.DRAFT || 0}\n`
    context += `- Órdenes retrasadas: ${analytics.overdueCount}\n`
    context += `- Órdenes críticas activas: ${analytics.criticalCount}\n`
    context += `- Cumplimiento de SLA: ${analytics.slaCompliance}%\n`
    context += `- Tiempo promedio de resolución: ${analytics.avgResolutionTime} horas\n\n`

    // Priority distribution
    context += `## Distribución por Prioridad\n`
    Object.entries(analytics.byPriority).forEach(([priority, count]) => {
      context += `- ${priority}: ${count}\n`
    })
    context += `\n`

    // Site performance
    if (sitePerformance.length > 0) {
      context += `## Performance por Sitio\n`
      sitePerformance.slice(0, 5).forEach(site => {
        context += `- ${site.siteName}: ${site.total} órdenes, ${site.completionRate}% completadas, ${site.overdue} retrasadas\n`
      })
      context += `\n`
    }

    // Trends
    if (timeseries.length > 5) {
      const recent = timeseries.slice(-7) // Last 7 days
      const previousWeek = timeseries.slice(-14, -7)

      const recentTotal = recent.reduce((sum, day) => sum + day.total, 0)
      const previousTotal = previousWeek.reduce((sum, day) => sum + day.total, 0)

      const trend = recentTotal > previousTotal ? 'aumento' : 'disminución'
      const percentChange = previousTotal > 0
        ? Math.round(((recentTotal - previousTotal) / previousTotal) * 100)
        : 0

      context += `## Tendencias Recientes\n`
      context += `- ${trend} del ${Math.abs(percentChange)}% en las órdenes vs semana anterior\n`
      context += `- Promedio diario última semana: ${Math.round(recentTotal / 7)} órdenes\n\n`
    }

    return context
  }

  /**
   * Build context for client analytics
   */
  private static buildClientAnalyticsContext(analytics: WorkOrderAnalytics, dateRange?: DateRange): string {
    const periodText = dateRange
      ? `del ${dateRange.from.toLocaleDateString('es-ES')} al ${dateRange.to.toLocaleDateString('es-ES')}`
      : 'del período actual'

    let context = `# Análisis de Mantenimiento ${periodText}\n\n`

    context += `## Resumen Ejecutivo\n`
    context += `- Total de órdenes de mantenimiento: ${analytics.total}\n`
    context += `- Completadas: ${analytics.byStatus.COMPLETED || 0} (${Math.round((analytics.byStatus.COMPLETED || 0) / analytics.total * 100)}%)\n`
    context += `- Cumplimiento de SLA del proveedor: ${analytics.slaCompliance}%\n`
    context += `- Tiempo promedio de respuesta: ${analytics.avgResolutionTime} horas\n`
    context += `- Órdenes retrasadas: ${analytics.overdueCount}\n`
    context += `- Órdenes críticas pendientes: ${analytics.criticalCount}\n`

    return context
  }

  /**
   * Build prompt for dashboard insights
   */
  private static buildDashboardInsightsPrompt(context: string): string {
    return `${context}

Como ingeniero industrial experto en gestión de mantenimiento, analiza estos datos y proporciona:

1. Un resumen ejecutivo (2-3 oraciones) del estado general
2. 3-5 insights clave en el siguiente formato JSON:

{
  "summary": "Resumen ejecutivo aquí",
  "insights": [
    {
      "type": "trend|alert|recommendation|prediction",
      "title": "Título breve del insight",
      "description": "Descripción detallada y accionable",
      "severity": "info|warning|critical",
      "impact": "low|medium|high",
      "actionable": true|false
    }
  ]
}

Enfócate en:
- Tendencias importantes (mejoras o deterioros)
- Alertas sobre problemas críticos
- Recomendaciones accionables para mejorar eficiencia
- Predicciones basadas en patrones

Sé conciso, específico y orientado a la acción. Usa términos de ingeniería industrial.`
  }

  /**
   * Build prompt for client insights
   */
  private static buildClientInsightsPrompt(context: string): string {
    return `${context}

Como gerente de mantenimiento y facilities, analiza el desempeño del proveedor de servicios y proporciona insights en formato JSON:

{
  "summary": "Evaluación general del servicio",
  "insights": [
    {
      "type": "trend|alert|recommendation|prediction",
      "title": "Título del insight",
      "description": "Análisis detallado",
      "severity": "info|warning|critical",
      "impact": "low|medium|high",
      "actionable": true|false
    }
  ]
}

Enfócate en:
- Calidad del servicio del proveedor
- Cumplimiento de SLAs
- Áreas de mejora
- Riesgos potenciales
- Recomendaciones para optimizar la relación con el proveedor

Sé profesional y orientado a resultados.`
  }

  /**
   * System prompt for industrial engineering context
   */
  private static getSystemPromptForIndustrial(): string {
    return `Eres un ingeniero industrial senior especializado en gestión de mantenimiento, CMMS y optimización de operaciones.

Tu expertise incluye:
- Análisis de KPIs de mantenimiento (MTTR, MTBF, OEE)
- Gestión de órdenes de trabajo y workflows
- Optimización de recursos y scheduling
- Análisis de causa raíz y resolución de problemas
- Estrategias de mantenimiento preventivo y predictivo
- Mejora continua y metodologías Lean

Proporciona análisis profesionales, accionables y basados en datos. Usa terminología técnica apropiada en español.
Tus respuestas deben ser claras, concisas y enfocadas en mejorar la eficiencia operativa.`
  }

  /**
   * System prompt for client admin context
   */
  private static getSystemPromptForClientAdmin(): string {
    return `Eres un gerente de facilities y mantenimiento con experiencia evaluando proveedores de servicios.

Tu expertise incluye:
- Evaluación de SLAs y cumplimiento de contratos
- Análisis de calidad de servicio
- Gestión de relaciones con proveedores
- Optimización de costos de mantenimiento
- Identificación de riesgos operacionales

Proporciona análisis profesionales desde la perspectiva del cliente que contrata servicios de mantenimiento.
Enfócate en la calidad del servicio, cumplimiento y valor agregado.`
  }

  /**
   * Parse AI response into structured insights
   */
  private static parseInsightsResponse(content: string): {
    summary: string
    items: AIInsight[]
  } {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        summary: parsed.summary || "Análisis generado por IA",
        items: Array.isArray(parsed.insights) ? parsed.insights : []
      }
    } catch (error) {
      console.error("Failed to parse AI insights response:", error)

      // Fallback: return raw content as single insight
      return {
        summary: "Análisis del período",
        items: [
          {
            type: 'trend',
            title: 'Análisis General',
            description: content,
            severity: 'info',
            impact: 'medium',
            actionable: false
          }
        ]
      }
    }
  }

  /**
   * Check if company can use AI insights
   */
  static async canGenerateInsights(companyId: string): Promise<{
    canGenerate: boolean
    reason?: string
  }> {
    const aiCheck = await OpenAIService.canUseAI(companyId)

    if (!aiCheck.canUse) {
      return {
        canGenerate: false,
        reason: aiCheck.reason
      }
    }

    return {
      canGenerate: true
    }
  }
}
