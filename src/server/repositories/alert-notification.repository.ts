import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { AlertNotificationWithRelations } from "@/types/notification.types"

/**
 * Repository para el acceso a datos de notificaciones de alertas
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class AlertNotificationRepository {

  private static readonly includeRelations = {
    user: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  }

  static async findById(id: string): Promise<AlertNotificationWithRelations | null> {
    return await prisma.alertNotification.findUnique({
      where: { id },
      include: AlertNotificationRepository.includeRelations
    })
  }

  static async findByAlert(alertId: string): Promise<AlertNotificationWithRelations[]> {
    return await prisma.alertNotification.findMany({
      where: { alertId },
      include: AlertNotificationRepository.includeRelations,
      orderBy: { createdAt: 'desc' }
    })
  }

  static async findByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ items: AlertNotificationWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      prisma.alertNotification.findMany({
        where: { userId },
        include: AlertNotificationRepository.includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.alertNotification.count({ where: { userId } })
    ])

    return { items: notifications, total }
  }

  static async create(
    data: Prisma.AlertNotificationCreateInput
  ): Promise<AlertNotificationWithRelations> {
    return await prisma.alertNotification.create({
      data,
      include: AlertNotificationRepository.includeRelations
    })
  }

  static async createMany(
    data: Prisma.AlertNotificationCreateManyInput[]
  ): Promise<number> {
    const result = await prisma.alertNotification.createMany({
      data,
      skipDuplicates: true
    })
    return result.count
  }

  static async update(
    id: string,
    data: Prisma.AlertNotificationUpdateInput
  ): Promise<AlertNotificationWithRelations> {
    return await prisma.alertNotification.update({
      where: { id },
      data,
      include: AlertNotificationRepository.includeRelations
    })
  }

  static async markAsSent(id: string): Promise<AlertNotificationWithRelations> {
    return await this.update(id, {
      status: "sent",
      sentAt: new Date()
    })
  }

  static async markAsDelivered(id: string): Promise<AlertNotificationWithRelations> {
    return await this.update(id, {
      status: "delivered",
      deliveredAt: new Date()
    })
  }

  static async markAsFailed(id: string, errorMessage: string): Promise<AlertNotificationWithRelations> {
    return await this.update(id, {
      status: "failed",
      errorMessage
    })
  }

  static async delete(id: string): Promise<AlertNotificationWithRelations> {
    return await prisma.alertNotification.delete({
      where: { id },
      include: AlertNotificationRepository.includeRelations
    })
  }

  /**
   * Encuentra notificaciones pendientes para procesar
   */
  static async findPending(limit: number = 100): Promise<AlertNotificationWithRelations[]> {
    return await prisma.alertNotification.findMany({
      where: {
        status: "pending"
      },
      include: AlertNotificationRepository.includeRelations,
      orderBy: { createdAt: 'asc' },
      take: limit
    })
  }
}
