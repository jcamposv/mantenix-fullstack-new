import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { getInitials } from "@/components/sidebar/sidebar-utils"
import type { Comment } from "./alert-detail-types"

interface AlertCommentsSectionProps {
  comments: Comment[]
  onAddComment: (content: string) => Promise<void>
  loading?: boolean
}

export function AlertCommentsSection({ comments, onAddComment, loading }: AlertCommentsSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      await onAddComment(newComment.trim())
      setNewComment("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentarios ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay comentarios todavía
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(comment.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Add Comment Form */}
        <div className="space-y-3">
          <Textarea
            placeholder="Escribir un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading || submitting}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!newComment.trim() || loading || submitting}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}