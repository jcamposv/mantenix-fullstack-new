"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Activity,
  RefreshCw,
  AlertCircle,
  Info,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"

const COOLDOWN_DURATION = 2 * 60 * 1000 // 2 minutes in milliseconds
const COOLDOWN_KEY = 'ai-insights-last-generated'

interface AIInsight {
  type: 'trend' | 'alert' | 'recommendation' | 'prediction'
  title: string
  description: string
  severity?: 'info' | 'warning' | 'critical'
  impact?: 'low' | 'medium' | 'high'
  actionable?: boolean
}

interface AIInsightsCardProps {
  dateRange?: DateRange
}

export function AIInsightsCard({ dateRange }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<{
    summary: string
    insights: AIInsight[]
  } | null>(null)
  const [loading, setLoading] = useState(false) // Don't auto-load
  const [error, setError] = useState<string | null>(null)
  const [canGenerate, setCanGenerate] = useState<boolean | null>(null) // null = checking, true = enabled, false = disabled
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)
  const [hasGenerated, setHasGenerated] = useState(false)

  // Check cooldown status
  const checkCooldown = useCallback(() => {
    const lastGenerated = localStorage.getItem(COOLDOWN_KEY)
    if (!lastGenerated) return 0

    const timeSinceLastGeneration = Date.now() - parseInt(lastGenerated)
    const remaining = COOLDOWN_DURATION - timeSinceLastGeneration

    return remaining > 0 ? remaining : 0
  }, [])

  // Update cooldown timer
  useEffect(() => {
    const updateCooldown = () => {
      const remaining = checkCooldown()
      setCooldownRemaining(remaining)

      if (remaining > 0) {
        setHasGenerated(true)
      }
    }

    updateCooldown()
    const interval = setInterval(updateCooldown, 1000)

    return () => clearInterval(interval)
  }, [checkCooldown])

  const fetchInsights = async () => {
    // Check cooldown
    const remaining = checkCooldown()
    if (remaining > 0) {
      const minutes = Math.ceil(remaining / 60000)
      toast.error(`Por favor espera ${minutes} minuto${minutes > 1 ? 's' : ''} antes de generar nuevos insights`)
      return
    }

    console.log('[AIInsightsCard] fetchInsights called', { dateRange })
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (dateRange?.from) {
        params.set('dateFrom', dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        params.set('dateTo', dateRange.to.toISOString())
      }

      console.log('[AIInsightsCard] Fetching:', `/api/client/ai-insights?${params.toString()}`)
      const response = await fetch(`/api/client/ai-insights?${params.toString()}`)
      const data = await response.json()
      console.log('[AIInsightsCard] Response:', { ok: response.ok, status: response.status, data })

      if (!response.ok) {
        // Check if it's a feature disabled error
        const isFeatureDisabled = data.error?.includes("not enabled") || data.error?.includes("Unauthorized")
        console.log('[AIInsightsCard] Feature disabled check:', isFeatureDisabled)
        setCanGenerate(isFeatureDisabled ? false : true)

        if (isFeatureDisabled) {
          console.log('[AIInsightsCard] Feature is disabled, hiding component')
          // Silently don't show - feature is disabled
          return
        }

        throw new Error(data.error || 'Error al generar insights')
      }

      setInsights(data.data)
      setCanGenerate(true)
      setHasGenerated(true)

      // Set cooldown timestamp
      localStorage.setItem(COOLDOWN_KEY, Date.now().toString())
      setCooldownRemaining(COOLDOWN_DURATION)

      console.log('[AIInsightsCard] Insights loaded successfully')
      toast.success("Insights generados exitosamente")
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      console.error('[AIInsightsCard] Error:', message, err)
      setError(message)
      // Only show error toast if feature is enabled but there was an error
      if (canGenerate !== false) {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Check feature availability on mount
  useEffect(() => {
    const checkFeature = async () => {
      try {
        const response = await fetch('/api/client/ai-insights')
        const data = await response.json()

        if (!response.ok) {
          const isFeatureDisabled = data.error?.includes("not enabled") || data.error?.includes("Unauthorized")
          setCanGenerate(isFeatureDisabled ? false : null)
        } else {
          setCanGenerate(true)
        }
      } catch {
        setCanGenerate(null)
      }
    }

    checkFeature()
  }, [])

  // Reset insights when date range changes
  useEffect(() => {
    setInsights(null)
    setError(null)
    setHasGenerated(false)
  }, [dateRange?.from, dateRange?.to])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-4 w-4" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />
      case 'recommendation':
        return <Lightbulb className="h-4 w-4" />
      case 'prediction':
        return <Activity className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive bg-destructive/10 border-destructive/20'
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20'
      case 'info':
      default:
        return 'text-info bg-info/10 border-info/20'
    }
  }

  const getImpactBadge = (impact?: string) => {
    if (!impact) return null

    const colors = {
      high: 'bg-destructive/10 text-destructive border-destructive/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      low: 'bg-success/10 text-success border-success/20'
    }

    const labels = {
      high: 'Alto Impacto',
      medium: 'Impacto Medio',
      low: 'Bajo Impacto'
    }

    return (
      <Badge variant="outline" className={cn("text-xs", colors[impact as keyof typeof colors])}>
        {labels[impact as keyof typeof labels]}
      </Badge>
    )
  }

  // If AI feature is not enabled, don't render anything
  if (canGenerate === false) {
    return null
  }

  // If still checking and loading, don't render yet
  if (canGenerate === null && loading) {
    return null
  }

  const formatCooldownTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${seconds}s`
  }

  const isOnCooldown = cooldownRemaining > 0

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Insights de IA</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Análisis inteligente y recomendaciones
              </CardDescription>
            </div>
          </div>
          {hasGenerated && insights && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInsights}
              disabled={loading || isOnCooldown}
              className="h-8"
              title={isOnCooldown ? `Disponible en ${formatCooldownTime(cooldownRemaining)}` : 'Regenerar insights'}
            >
              {isOnCooldown ? (
                <>
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">{formatCooldownTime(cooldownRemaining)}</span>
                </>
              ) : (
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Initial State - No insights generated yet */}
        {!hasGenerated && !loading && !insights && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-base font-medium mb-2">
              Genera insights con IA
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Obtén análisis inteligente, tendencias y recomendaciones personalizadas para tus órdenes de trabajo
            </p>
            <Button
              onClick={fetchInsights}
              disabled={loading || isOnCooldown}
              size="lg"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generar Insights
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Podrás regenerar cada 2 minutos
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Generando insights con IA...
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Esto puede tomar unos segundos
              </p>
            </div>
          </div>
        )}

        {error && !loading && !insights && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInsights}
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        )}

        {insights && !loading && (
          <div className="space-y-4">
            {/* Summary */}
            {insights.summary && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-foreground leading-relaxed">
                  {insights.summary}
                </p>
              </div>
            )}

            {/* Insights list */}
            {insights.insights.length > 0 && (
              <div className="space-y-3">
                {insights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border transition-colors hover:bg-accent/5",
                      getSeverityColor(insight.severity)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 p-1.5 rounded-md",
                        insight.severity === 'critical' && "bg-destructive/10",
                        insight.severity === 'warning' && "bg-warning/10",
                        insight.severity === 'info' && "bg-info/10"
                      )}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium leading-tight">
                            {insight.title}
                          </h4>
                          {getImpactBadge(insight.impact)}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <Badge
                            variant="outline"
                            className="mt-2 text-xs bg-primary/5 text-primary border-primary/20"
                          >
                            Accionable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {insights.insights.length === 0 && (
              <div className="text-center py-6">
                <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No se encontraron insights significativos para este período
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
