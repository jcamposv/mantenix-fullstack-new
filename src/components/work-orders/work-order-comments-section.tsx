/**
 * Work Order Comments Section Component
 * Displays and manages comments for work orders
 * Supports internal/public comments, editing, and deleting
 * Uses React Hook Form with Zod validation
 */

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, MoreVertical, Edit, Trash2, Lock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { getInitials } from "@/components/sidebar/sidebar-utils"
import { useWorkOrderComments } from "@/hooks/use-work-order-comments"
import { useSession } from "@/lib/auth-client"
import { usePermissions } from "@/hooks/usePermissions"
import { toast } from "sonner"
import {
  createWorkOrderCommentSchema,
  updateWorkOrderCommentSchema,
  type CreateWorkOrderCommentInput,
  type UpdateWorkOrderCommentInput,
} from "@/app/api/schemas/work-order-comment-schemas"

interface WorkOrderCommentsSectionProps {
  workOrderId: string
}

export function WorkOrderCommentsSection({
  workOrderId,
}: WorkOrderCommentsSectionProps) {
  const { data: session } = useSession()
  const { hasPermission } = usePermissions()
  const { comments, loading, addComment, updateComment, deleteComment } =
    useWorkOrderComments({
      workOrderId,
      enabled: true,
    })

  const [editingId, setEditingId] = useState<string | null>(null)

  // Check if user can comment on work orders
  const canComment = hasPermission("work_orders.comment")

  // Check if user can create internal comments (same as canComment for now, backend validates role)
  const canCreateInternal = canComment

  // Form for new comments
  const form = useForm<CreateWorkOrderCommentInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createWorkOrderCommentSchema) as any,
    defaultValues: {
      content: "",
      isInternal: false,
    },
  })

  // Form for editing comments
  const editForm = useForm<UpdateWorkOrderCommentInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateWorkOrderCommentSchema) as any,
    defaultValues: {
      content: "",
      isInternal: false,
    },
  })

  const handleSubmit = async (data: CreateWorkOrderCommentInput) => {
    try {
      await addComment(data.content, data.isInternal)
      form.reset()
      toast.success("Comentario agregado exitosamente")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al agregar comentario"
      )
    }
  }

  const handleEdit = (commentId: string, content: string, internal: boolean) => {
    setEditingId(commentId)
    editForm.reset({
      content,
      isInternal: internal,
    })
  }

  const handleSaveEdit = async (data: UpdateWorkOrderCommentInput) => {
    if (!editingId) return

    try {
      await updateComment(editingId, data.content!, data.isInternal)
      setEditingId(null)
      editForm.reset()
      toast.success("Comentario actualizado exitosamente")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar comentario"
      )
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    editForm.reset()
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) return

    try {
      await deleteComment(commentId)
      toast.success("Comentario eliminado exitosamente")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar comentario"
      )
    }
  }

  const canEditOrDelete = (authorId: string): boolean => {
    if (!session?.user) return false

    const user = session.user as { id?: string } | undefined
    if (!user?.id) return false

    const isAuthor = user.id === authorId

    // Check if user has permission to manage work orders (can edit/delete any comment)
    const canManage = hasPermission("work_orders.manage") || hasPermission("work_orders.*")

    return isAuthor || canManage
  }

  // Don't render if user doesn't have permission to view comments
  if (!canComment && comments.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentarios ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay comentarios todavía
              </p>
            ) : (
              comments.map((comment) => {
                const isEditing = editingId === comment.id

                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>
                        {getInitials(comment.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        {comment.isInternal && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Interno
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                        {canEditOrDelete(comment.authorId) && !isEditing && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEdit(
                                    comment.id,
                                    comment.content,
                                    comment.isInternal
                                  )
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(comment.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {isEditing ? (
                        <Form {...editForm}>
                          <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-2">
                            <FormField
                              control={editForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      rows={3}
                                      className="text-sm"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {canCreateInternal && (
                              <FormField
                                control={editForm.control}
                                name="isInternal"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      Comentario interno (solo visible para equipo técnico)
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            )}

                            <div className="flex gap-2">
                              <Button type="submit" size="sm">
                                Guardar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {canComment && (
          <div className="pt-4 border-t">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Escribir un comentario..."
                          {...field}
                          disabled={loading || form.formState.isSubmitting}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {canCreateInternal && (
                  <FormField
                    control={form.control}
                    name="isInternal"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading || form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Comentario interno (solo visible para equipo técnico)
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  type="submit"
                  disabled={loading || form.formState.isSubmitting}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {form.formState.isSubmitting ? "Enviando..." : "Comentar"}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
