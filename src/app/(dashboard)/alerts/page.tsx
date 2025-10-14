"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Calendar, Clock, MapPin, MessageCircle, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { alertTypes, alertPriorities } from "@/schemas/alert"
import { getInitials } from "@/components/sidebar/sidebar-utils"
import { useAlertUpdates } from "@/hooks/useAlertUpdates"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/alerts')
      if (!response.ok) throw new Error('Error fetching alerts')
      
      const data: AlertsResponse = await response.json()
      setAlerts(data.alerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Listen for real-time alert updates
  useAlertUpdates({
    onRefreshNeeded: fetchAlerts
  })

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = alertPriorities.find(p => p.value === priority)
    if (!priorityConfig) return priority

    const variants = {
      LOW: "secondary",
      MEDIUM: "default", 
      HIGH: "warning",
      CRITICAL: "destructive"
    } as const

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "default"}>
        {priorityConfig.label}
      </Badge>
    )
  }

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
      header: "Alerta",
      cell: ({ row }) => {
        const alert = row.original
        return (
          <div className="flex items-start space-x-3 min-w-0">
            <div className="text-lg flex-shrink-0">
              {getTypeIcon(alert.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{alert.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {alert.description}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {getTypeLabel(alert.type)}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => getPriorityBadge(row.getValue("priority")),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
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
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
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
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {getInitials(reportedBy.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{reportedBy.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "reportedAt",
      header: "Reportada",
      cell: ({ row }) => {
        const date = new Date(row.getValue("reportedAt"))
        return (
          <div className="flex items-center space-x-1 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">
              {formatDistanceToNow(date, { addSuffix: true, locale: es })}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "_count.comments",
      header: "Comentarios",
      cell: ({ row }) => {
        const count = row.original._count.comments
        if (count === 0) return null
        return (
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{count}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const alert = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(alert.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={columns}
        data={alerts}
        searchKey="title"
        searchPlaceholder="Buscar alertas..."
        title="Todas las Alertas"
        description="Gestiona todas las alertas del sistema"
        loading={loading}
      />
    </div>
  )
}