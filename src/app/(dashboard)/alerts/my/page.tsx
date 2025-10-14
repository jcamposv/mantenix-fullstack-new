"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Clock, MapPin, MessageCircle, User, UserCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { alertTypes, alertPriorities } from "@/schemas/alert"
import { getInitials } from "@/components/sidebar/sidebar-utils"
import { useAlertUpdates } from "@/hooks/useAlertUpdates"
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

export default function MyAlertsPage() {
  const [reportedAlerts, setReportedAlerts] = useState<Alert[]>([])
  const [assignedAlerts, setAssignedAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("reported")
  const router = useRouter()

  const fetchMyAlerts = useCallback(async (tab: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        my: tab // 'reported' or 'assigned'
      })

      const response = await fetch(`/api/alerts?${params}`)
      if (!response.ok) throw new Error('Error fetching alerts')
      
      const data: AlertsResponse = await response.json()
      
      if (tab === 'reported') {
        setReportedAlerts(data.alerts)
      } else {
        setAssignedAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Error fetching my alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyAlerts(activeTab)
  }, [activeTab, fetchMyAlerts])

  // Listen for real-time alert updates
  useAlertUpdates({
    onRefreshNeeded: () => fetchMyAlerts(activeTab)
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

  const getColumns = (isReported: boolean): ColumnDef<Alert>[] => [
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
      accessorKey: isReported ? "assignedTo.name" : "reportedBy.name",
      header: isReported ? "Asignado a" : "Reportado por",
      cell: ({ row }) => {
        const alert = row.original
        const person = isReported ? alert.assignedTo : alert.reportedBy
        
        if (!person) {
          return isReported ? (
            <span className="text-muted-foreground text-sm">Sin asignar</span>
          ) : null
        }

        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{person.name}</span>
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

  const reportedColumns = getColumns(true)
  const assignedColumns = getColumns(false)

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Alertas</h2>
          <p className="text-muted-foreground">
            Alertas reportadas por ti y asignadas a ti
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reported" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Reportadas por mí
            </TabsTrigger>
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Asignadas a mí
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reported">
            <DataTable
              columns={reportedColumns}
              data={reportedAlerts}
              searchKey="title"
              searchPlaceholder="Buscar mis alertas reportadas..."
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="assigned">
            <DataTable
              columns={assignedColumns}
              data={assignedAlerts}
              searchKey="title"
              searchPlaceholder="Buscar mis alertas asignadas..."
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}