import { CommentRepository } from "../repositories/comment.repository"
import { AlertService } from "./alert.service"
import { AuthService } from "./auth.service"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { CommentWithAuthor, CreateCommentData } from "@/types/comment.types"
import type { CreateCommentInput } from "../../app/api/schemas/comment-schemas"

/**
 * Servicio de lógica de negocio para comentarios
 * Contiene las reglas de negocio y orquesta las operaciones
 */
export class CommentService {
  
  /**
   * Obtiene todos los comentarios de una alerta
   * Verifica que el usuario tenga acceso a la alerta
   */
  static async getByAlert(alertId: string, session: AuthenticatedSession): Promise<CommentWithAuthor[]> {
    // Verificar que el usuario tenga acceso a la alerta
    const alert = await AlertService.getById(alertId, session)
    if (!alert) {
      throw new Error("Alerta no encontrada o sin acceso")
    }

    return await CommentRepository.findManyByAlert(alertId)
  }

  /**
   * Crea un nuevo comentario en una alerta
   * Verifica permisos y acceso a la alerta
   */
  static async create(alertId: string, commentData: CreateCommentInput, session: AuthenticatedSession): Promise<CommentWithAuthor> {
    // Verificar que el usuario tenga acceso a la alerta
    const alert = await AlertService.getById(alertId, session)
    if (!alert) {
      throw new Error("Alerta no encontrada o sin acceso")
    }

    // Verificar permisos para comentar
    if (!AuthService.canUserPerformAction(session.user.role, 'create_comment')) {
      throw new Error("No tienes permisos para comentar en alertas")
    }

    const createData: CreateCommentData = {
      content: commentData.content,
      alertId,
      authorId: session.user.id
    }

    return await CommentRepository.create(createData)
  }
}