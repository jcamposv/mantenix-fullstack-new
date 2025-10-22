"use client"

import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DashboardErrorProps {
  error: Error | null
  onRetry?: () => void
  className?: string
}

export function DashboardError({ error, onRetry, className }: DashboardErrorProps) {
  // Determine error type and appropriate icon/message
  const getErrorDetails = (error: Error | null) => {
    const message = error?.message || 'Error desconocido'
    
    if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
      return {
        icon: WifiOff,
        title: 'Sin conexión',
        description: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
        variant: 'destructive' as const
      }
    }
    
    if (message.includes('401') || message.includes('unauthorized') || message.includes('No autorizado')) {
      return {
        icon: AlertTriangle,
        title: 'Sesión expirada',
        description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        variant: 'destructive' as const
      }
    }
    
    if (message.includes('500') || message.includes('server') || message.includes('servidor')) {
      return {
        icon: AlertTriangle,
        title: 'Error del servidor',
        description: 'Hay un problema temporal en nuestros servidores. Inténtalo de nuevo en unos momentos.',
        variant: 'destructive' as const
      }
    }
    
    return {
      icon: AlertTriangle,
      title: 'Error al cargar datos',
      description: 'No se pudieron cargar las estadísticas del dashboard. Inténtalo de nuevo.',
      variant: 'destructive' as const
    }
  }

  const { icon: Icon, title, description, variant } = getErrorDetails(error)

  return (
    <div className={className}>
      <Card className="border-destructive/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icon className="h-5 w-5" />
            Dashboard no disponible
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="mt-2">
              {description}
            </AlertDescription>
          </Alert>
          
          {onRetry && (
            <div className="flex items-center justify-center pt-2">
              <Button 
                variant="outline" 
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Si el problema persiste, contacta al soporte técnico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}