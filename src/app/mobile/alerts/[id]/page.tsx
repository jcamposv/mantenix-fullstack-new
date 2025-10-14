"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  AlertTriangle,
  MessageSquare,
  Send,
  Camera,
  Calendar,
  Hash,
  Timer
} from "lucide-react"
import { toast } from "sonner"
import { alertPriorities, alertTypes } from "@/schemas/alert"

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
  reportedAt: string
  resolvedAt?: string
  site: {
    id: string
    name: string
    clientCompany: {
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

const priorityColors = {
  LOW: "bg-blue-500",
  MEDIUM: "bg-yellow-500", 
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500"
}

const statusColors = {
  OPEN: "bg-red-100 text-red-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800"
}

const statusLabels = {
  OPEN: "Abierta",
  ASSIGNED: "Asignada",
  IN_PROGRESS: "En Proceso",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada"
}

export default function AlertDetailPage() {
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const router = useRouter()
  const params = useParams()
  const alertId = params.id as string

  useEffect(() => {
    if (alertId) {
      fetchAlert()
    }
  }, [alertId])

  const fetchAlert = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/alerts/${alertId}`)
      
      if (response.ok) {
        const data = await response.json()
        setAlert(data)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cargar la alerta')
        router.back()
      }
    } catch (error) {
      console.error('Error fetching alert:', error)
      toast.error('Error al cargar la alerta')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return

    try {
      setSubmittingComment(true)
      const response = await fetch(`/api/alerts/${alertId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: commentText
        })
      })

      if (response.ok) {
        const newComment = await response.json()
        setAlert(prev => prev ? {
          ...prev,
          comments: [...prev.comments, newComment]
        } : null)
        setCommentText("")
        toast.success('Comentario agregado')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al agregar comentario')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Error al agregar comentario')
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `hace ${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return `hace ${Math.floor(diffInHours)}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `hace ${diffInDays}d`
    }
  }

  const alertType = alertTypes.find(t => t.value === alert?.type)
  const alertPriority = alertPriorities.find(p => p.value === alert?.priority)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-24 bg-muted rounded mb-4"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-2">Alerta no encontrada</h3>
        <p className="text-muted-foreground text-sm mb-4">
          La alerta que buscas no existe o no tienes permisos para verla.
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 -mx-4 px-4 py-3 border-b bg-background sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold truncate">{alert.title}</h1>
          <p className="text-sm text-muted-foreground">Alerta #{alert.id.slice(-8)}</p>
        </div>
      </div>

      {/* Status and Priority */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Badge className={statusColors[alert.status as keyof typeof statusColors]}>
              {statusLabels[alert.status as keyof typeof statusLabels]}
            </Badge>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${priorityColors[alert.priority as keyof typeof priorityColors]}`}></div>
              <span className="text-sm font-medium">{alertPriority?.label}</span>
            </div>
          </div>
          
          <h2 className="font-semibold mb-2">{alert.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{alert.description}</p>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium">{alertType?.label}</p>
              </div>
            </div>
            
            {alert.estimatedResolutionTime && (
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo estimado</p>
                  <p className="text-sm font-medium">{alert.estimatedResolutionTime} min</p>
                </div>
              </div>
            )}
          </div>

          {alert.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ubicación</p>
                <p className="text-sm font-medium">{alert.location}</p>
              </div>
            </div>
          )}

          {alert.equipmentId && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Equipo</p>
                <p className="text-sm font-medium">{alert.equipmentId}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Reportada</p>
              <p className="text-sm font-medium">{formatDate(alert.reportedAt)}</p>
              <p className="text-xs text-muted-foreground">{getRelativeTime(alert.reportedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site and People */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Sede y Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sede</p>
            <p className="font-medium">{alert.site.name}</p>
            <p className="text-sm text-muted-foreground">{alert.site.clientCompany.name}</p>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                {alert.reportedBy.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Reportado por</p>
              <p className="text-sm font-medium">{alert.reportedBy.name}</p>
            </div>
          </div>

          {alert.assignedTo && (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {alert.assignedTo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Asignado a</p>
                <p className="text-sm font-medium">{alert.assignedTo.name}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      {alert.images && alert.images.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Imágenes ({alert.images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {alert.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comentarios ({alert.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alert.comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay comentarios aún
            </p>
          ) : (
            <div className="space-y-3">
              {alert.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback>
                      {comment.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{comment.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(comment.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Add Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Agregar un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
                size="sm"
              >
                {submittingComment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Comentar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}