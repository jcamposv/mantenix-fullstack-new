"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { alertTypes, alertPriorities } from "@/schemas/alert"
import { WorkOrderComments } from "@/components/client/work-order-comments"

interface Alert {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  location?: string
  equipmentId?: string
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
  assignedTo?: {
    id: string
    name: string
    email: string
  }
}

interface AlertComment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

export default function ClientAlertDetailPage() {
  const params = useParams()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [comments, setComments] = useState<AlertComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const [alertRes, commentsRes] = await Promise.all([
          fetch(`/api/client/alerts/${params.id}`),
          fetch(`/api/client/alerts/${params.id}/comments`),
        ])

        if (!alertRes.ok) {
          throw new Error("Error al cargar la alerta")
        }

        const alertData = await alertRes.json()
        const commentsData = commentsRes.ok ? await commentsRes.json() : { comments: [] }

        setAlert(alertData)
        setComments(commentsData.comments || [])
      } catch (error) {
        console.error("Error:", error)
        toast.error("Error al cargar la alerta")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAlert()
    }
  }, [params.id])

  const handleAddComment = async (content: string) => {
    try {
      const response = await fetch(`/api/client/alerts/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar comentario")
      }

      const data = await response.json()
      setComments([...comments, data])
      toast.success("Comentario agregado")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al agregar comentario")
      throw error
    }
  }

  const getTypeIcon = (type: string) => {
    const alertType = alertTypes.find((t) => t.value === type)
    return alertType?.icon || "❓"
  }

  const getTypeLabel = (type: string) => {
    const alertType = alertTypes.find((t) => t.value === type)
    return alertType?.label || type
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = alertPriorities.find((p) => p.value === priority)
    const variants = {
      LOW: "secondary",
      MEDIUM: "default",
      HIGH: "outline",
      CRITICAL: "destructive",
    } as const

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "default"}>
        {priorityConfig?.label || priority}
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

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!alert) {
    return null
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{getTypeIcon(alert.type)}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{alert.title}</h1>
            <p className="text-muted-foreground mt-1">{getTypeLabel(alert.type)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Alerta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {alert.description}
                </p>
              </div>

              {alert.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">{alert.location}</p>
                  </div>
                </div>
              )}

              {alert.equipmentId && (
                <div>
                  <label className="text-sm font-medium">ID del Equipo</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.equipmentId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <WorkOrderComments
            workOrderId={params.id as string}
            comments={comments}
            onAddComment={handleAddComment}
            loading={loading}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Estado Actual</p>
                {getStatusBadge(alert.status)}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Prioridad</p>
                {getPriorityBadge(alert.priority)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Sede</p>
                  <p className="text-muted-foreground">{alert.site.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Reportado por</p>
                  <p className="text-muted-foreground">{alert.reportedBy.name}</p>
                </div>
              </div>

              {alert.assignedTo && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Asignado a</p>
                    <p className="text-muted-foreground">{alert.assignedTo.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Reportada</p>
                  <p className="text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.reportedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
