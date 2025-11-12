"use client"

import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Eye, Clock, MapPin, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { alertTypes, alertPriorities } from "@/schemas/alert"
import { useTableData } from "@/components/hooks/use-table-data"
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
  }
  reportedBy: {
    id: string
    name: string
    email: string
  }
}

interface AlertsResponse {
  alerts: Alert[]
}

export default function ClientAlertsPage() {
  const router = useRouter()
  const { data: alerts, loading } = useTableData<Alert>({
    endpoint: "/api/client/alerts",
    transform: (data) => (data as AlertsResponse).alerts || [],
  })

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = alertPriorities.find((p) => p.value === priority)
    if (!priorityConfig) return priority

    const variants = {
      LOW: "secondary",
      MEDIUM: "default",
      HIGH: "outline",
      CRITICAL: "destructive",
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
      ASSIGNED: "default",
      IN_PROGRESS: "default",
      RESOLVED: "secondary",
      CLOSED: "outline",
    } as const

    const labels = {
      OPEN: "Abierta",
      ASSIGNED: "Asignada",
      IN_PROGRESS: "En Progreso",
      RESOLVED: "Resuelta",
      CLOSED: "Cerrada",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    const alertType = alertTypes.find((t) => t.value === type)
    return alertType?.icon || "❓"
  }

  const getTypeLabel = (type: string) => {
    const alertType = alertTypes.find((t) => t.value === type)
    return alertType?.label || type
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
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
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
      id: "actions",
      cell: ({ row }) => {
        const alert = row.original
        const actions = [
          {
            label: "Ver detalles",
            icon: Eye,
            onClick: () => router.push(`/client/alerts/${alert.id}`),
          },
        ]

        return <TableActions actions={actions} />
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
            <p className="text-muted-foreground">
              Gestiona las alertas de tu organización
            </p>
          </div>
          <Button onClick={() => router.push("/client/alerts/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Alerta
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={alerts}
        searchKey="title"
        searchPlaceholder="Buscar alertas..."
        loading={loading}
      />
    </div>
  )
}
