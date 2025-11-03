"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Clock, MapPin, MessageCircle, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { alertTypes } from "@/schemas/alert"
import { useAlertUpdates } from "@/hooks/useAlertUpdates"
import { useRouter } from "next/navigation"
import { UserAvatar } from "@/components/common/user-avatar"
import { TableActions } from "@/components/common/table-actions"

interface Alert {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  location?: string
  reportedAt: string
  site: {
    id: string
    name: string
    clientCompany?: {
      id: string
      name: string
    }
  }
  reportedBy: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  _count: {
    comments: number
  }
}

interface AlertsResponse {
  alerts: Alert[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function CriticalAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchCriticalAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        priority: 'CRITICAL'
      })

      const response = await fetch(`/api/alerts?${params}`)
      if (!response.ok) throw new Error('Error fetching critical alerts')
      
      const data: AlertsResponse = await response.json()
      setAlerts(data.alerts  || data || [])
    } catch (error) {
      console.error('Error fetching critical alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCriticalAlerts()
  }, [fetchCriticalAlerts])

  // Listen for real-time alert updates
  useAlertUpdates({
    onRefreshNeeded: fetchCriticalAlerts
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      OPEN: "destructive",
      IN_PROGRESS: "default",
      RESOLVED: "secondary",
      CLOSED: "outline"
    } as const

    const labels = {
      OPEN: "Abierta",
      IN_PROGRESS: "En Progreso", 
      RESOLVED: "Resuelta",
      CLOSED: "Cerrada"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type)
    return alertType?.icon || "❓"
  }

  const getTypeLabel = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type)
    return alertType?.label || type
  }

  const handleView = (alertId: string) => {
    router.push(`/alerts/${alertId}`)
  }

  const columns: ColumnDef<Alert>[] = [
    {
      accessorKey: "title",
      header: "Alerta Crítica",
      cell: ({ row }) => {
        const alert = row.original
        return (
          <div className="flex items-start space-x-3 min-w-0">
            <div className="text-lg flex-shrink-0">
              {getTypeIcon(alert.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate text-red-800 dark:text-red-200">
                {alert.title}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300 line-clamp-2">
                {alert.description}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {getTypeLabel(alert.type)} • CRÍTICA
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "site.name",
      header: "Sede",
      cell: ({ row }) => {
        const site = row.original.site
        return (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{site.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "reportedBy.name",
      header: "Reportado por",
      cell: ({ row }) => {
        const reportedBy = row.original.reportedBy
        return (
          <div className="flex items-center space-x-2">
            <UserAvatar 
              name={reportedBy.name} 
              size="sm" 
              className="border border-red-200 bg-red-50 text-red-700" 
            />
            <span className="truncate text-sm text-red-600 dark:text-red-400">
              {reportedBy.name}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "reportedAt",
      header: "Tiempo Transcurrido",
      cell: ({ row }) => {
        const date = new Date(row.getValue("reportedAt"))
        const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
        const isUrgent = hoursAgo > 4 // More than 4 hours is very urgent for critical alerts
        
        return (
          <div className={`flex items-center space-x-1 text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-red-500'}`}>
            <Clock className="h-3 w-3" />
            <span className="truncate">
              {formatDistanceToNow(date, { addSuffix: true, locale: es })}
            </span>
            {isUrgent && <AlertTriangle className="h-3 w-3 animate-pulse" />}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.getValue("reportedAt"))
        const dateB = new Date(rowB.getValue("reportedAt"))
        return dateB.getTime() - dateA.getTime() // Most recent first
      }
    },
    {
      accessorKey: "_count.comments",
      header: "Comentarios",
      cell: ({ row }) => {
        const count = row.original._count.comments
        if (count === 0) return null
        return (
          <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
            <MessageCircle className="h-3 w-3" />
            <span className="text-sm">{count}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const alert = row.original
        const actions = [
          {
            label: "Ver detalles",
            icon: Eye,
            onClick: () => handleView(alert.id)
          }
        ]
        
        return <TableActions actions={actions} />
      },
    },
  ]

  return (
    <div className="container mx-auto py-0">
      <div className="space-y-6">
        {/* Header con alerta informativa */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Alertas Críticas
            </h2>
            <p className="text-muted-foreground">
              Alertas de prioridad crítica que requieren atención inmediata
            </p>
          </div>
        </div>

        {/* Alerta de información */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800 dark:text-red-200">
                Atención: Alertas de Alta Prioridad
              </CardTitle>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300">
              Estas alertas requieren acción inmediata. Las alertas que llevan más de 4 horas 
              se marcan como extremadamente urgentes con indicadores visuales adicionales.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tabla de alertas críticas */}
        <div className="border-red-200 rounded-lg border bg-red-50/50 dark:bg-red-950/50 p-1">
          <DataTable
            columns={columns}
            data={alerts}
            searchKey="title"
            searchPlaceholder="Buscar alertas críticas..."
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}