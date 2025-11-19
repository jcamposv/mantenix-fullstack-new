import { prisma } from "@/lib/prisma"
import type { CommentWithAuthor, CreateCommentData } from "@/types/comment.types"

/**
 * Repository para el acceso a datos de comentarios
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class CommentRepository {
  static async findManyByAlert(alertId: string): Promise<CommentWithAuthor[]> {
    return await prisma.alertComment.findMany({
      where: { alertId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    }) as unknown as CommentWithAuthor[]
  }

  static async create(data: CreateCommentData): Promise<CommentWithAuthor> {
    return await prisma.alertComment.create({
      data: {
        content: data.content,
        alertId: data.alertId,
        authorId: data.authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true
              }
            }
          }
        }
      }
    }) as unknown as CommentWithAuthor
  }
}