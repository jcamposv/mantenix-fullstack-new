"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  MessageCircle, 
  ArrowLeft,
  Edit,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import { alertTypes, alertPriorities } from "@/schemas/alert"
import { getInitials } from "@/components/sidebar/sidebar-utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Alert {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  location?: string
  equipmentId?: string
  estimatedResolutionTime?: number
  images?: string[]
  documents?: string[]
  reportedAt: string
  resolvedAt?: string
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
  resolvedBy?: {
    id: string
    name: string
    email: string
  }
  comments: Comment[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

export default function AlertDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchAlert()
  }, [params.id])

  const fetchAlert = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/alerts/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Alerta no encontrada")
          router.push("/alerts")
          return
        }
        throw new Error('Error fetching alert')
      }
      
      const data = await response.json()
      setAlert(data)
    } catch (error) {
      console.error('Error fetching alert:', error)
      toast.error("Error al cargar la alerta")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!alert) return
    
    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Error updating status')

      const updatedAlert = await response.json()
      setAlert(updatedAlert)
      toast.success("Estado actualizado correctamente")
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error("Error al actualizar el estado")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !alert) return

    try {
      setSubmittingComment(true)
      const response = await fetch(`/api/alerts/${alert.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (!response.ok) throw new Error('Error adding comment')

      // Refresh the alert to get updated comments
      await fetchAlert()
      setNewComment("")
      toast.success("Comentario agregado")
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error("Error al agregar comentario")
    } finally {
      setSubmittingComment(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = alertPriorities.find(p => p.value === priority)
    if (!priorityConfig) return null

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

    const icons = {
      OPEN: XCircle,
      IN_PROGRESS: PlayCircle,
      RESOLVED: CheckCircle,
      CLOSED: CheckCircle
    } as const

    const Icon = icons[status as keyof typeof icons] || XCircle

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
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

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-muted rounded"></div>
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
          <div className="h-8 w-3/4 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Alerta no encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              La alerta que buscas no existe o no tienes permisos para verla.
            </p>
            <Button asChild>
              <Link href="/alerts">Volver a alertas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/alerts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a alertas
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon(alert.type)}</span>
            {alert.title}
          </h1>
          <p className="text-muted-foreground">
            ID: {alert.id} • {getTypeLabel(alert.type)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getPriorityBadge(alert.priority)}
          {getStatusBadge(alert.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contenido principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Descripción */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{alert.description}</p>
            </CardContent>
          </Card>

          {/* Imágenes y documentos */}
          {((alert.images && alert.images.length > 0) || (alert.documents && alert.documents.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle>Archivos adjuntos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alert.images && alert.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Imágenes</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {alert.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="rounded-md border aspect-square object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {alert.documents && alert.documents.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Documentos</h4>
                    <div className="space-y-2">
                      {alert.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded border hover:bg-muted"
                        >
                          <div className="h-4 w-4 bg-blue-100 rounded"></div>
                          Documento {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comentarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comentarios ({alert.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nuevo comentario */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Agregar un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingComment ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Lista de comentarios */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {alert.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(comment.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {(!alert.comments || alert.comments.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      No hay comentarios aún
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cambiar estado:</label>
                <Select
                  value={alert.status}
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Abierta</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="RESOLVED">Resuelta</SelectItem>
                    <SelectItem value="CLOSED">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Sede:</span>
                  <span>{alert.site.name}</span>
                </div>

                {alert.location && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Ubicación:</span>
                    <span>{alert.location}</span>
                  </div>
                )}

                {alert.equipmentId && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 text-muted-foreground">🔧</div>
                    <span className="font-medium">Equipo:</span>
                    <span>{alert.equipmentId}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Reportada:</span>
                  <span>{format(new Date(alert.reportedAt), "dd/MM/yyyy HH:mm")}</span>
                </div>

                {alert.resolvedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Resuelta:</span>
                    <span>{format(new Date(alert.resolvedAt), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                )}

                {alert.estimatedResolutionTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Tiempo estimado:</span>
                    <span>{alert.estimatedResolutionTime}h</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personas involucradas */}
          <Card>
            <CardHeader>
              <CardTitle>Personas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(alert.reportedBy.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.reportedBy.name}</p>
                    <p className="text-xs text-muted-foreground">Reportó la alerta</p>
                  </div>
                </div>

                {alert.assignedTo && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(alert.assignedTo.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.assignedTo.name}</p>
                      <p className="text-xs text-muted-foreground">Asignado</p>
                    </div>
                  </div>
                )}

                {alert.resolvedBy && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(alert.resolvedBy.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.resolvedBy.name}</p>
                      <p className="text-xs text-muted-foreground">Resolvió la alerta</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}