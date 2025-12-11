"use client"

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
import { useAIInsights } from "@/hooks/use-ai-insights"

interface AIInsightsCardProps {
  dateRange?: DateRange
}

export function AIInsightsCard({ dateRange }: AIInsightsCardProps) {
  const {
    data: insights,
    error,
    isLoading: loading,
    generate,
    isOnCooldown,
    cooldownRemaining,
    isFeatureEnabled,
    hasGenerated,
  } = useAIInsights({ dateRange })

  // Handle generate button click
  const handleGenerate = async () => {
    try {
      await generate()
      toast.success("Insights generados exitosamente")
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al generar insights'
      toast.error(message)
    }
  }

  // If AI feature is not enabled, don't render anything
  if (isFeatureEnabled === false) {
    return null
  }

  // If still checking and loading, don't render yet
  if (isFeatureEnabled === null && loading) {
    return null
  }

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

  const formatCooldownTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${seconds}s`
  }

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
              onClick={handleGenerate}
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
              onClick={handleGenerate}
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
            <p className="text-sm text-destructive mb-2">{error.message || 'Error al generar insights'}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
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
