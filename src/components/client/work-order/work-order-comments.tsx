"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string | null
  }
}

interface WorkOrderCommentsProps {
  workOrderId: string
  initialComments?: Comment[]
}

export function WorkOrderComments({ workOrderId, initialComments = [] }: WorkOrderCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      toast.error("Por favor escribe un comentario")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/work-orders/${workOrderId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newComment })
      })

      if (!response.ok) {
        throw new Error("Error al crear el comentario")
      }

      const { comment } = await response.json()
      setComments([comment, ...comments])
      setNewComment("")
      toast.success("Comentario agregado exitosamente")
    } catch (error) {
      console.error("Error creating comment:", error)
      toast.error("Error al crear el comentario")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comentarios
          {comments.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !newComment.trim()}
            >
              <Send className="mr-2 h-3 w-3" />
              {isSubmitting ? "Enviando..." : "Enviar Comentario"}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay comentarios aún</p>
            <p className="text-xs mt-1">Sé el primero en comentar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={cn(
                  "flex gap-3 p-4 rounded-lg border bg-card",
                  index === 0 && "border-primary/50 bg-primary/5"
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={comment.author.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{comment.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {comment.author.email}
                      </p>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
