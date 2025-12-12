import { Prisma } from "@prisma/client"
import type { AlertWithRelations } from "@/types/alert.types"
import type {
  NotificationRecipient,
  NotificationReason
} from "@/types/notification.types"
import { ESCALATION_RULES } from "@/types/notification.types"
import { UserRepository } from "@/server/repositories/user.repository"
import { AlertNotificationRepository } from "@/server/repositories/alert-notification.repository"
import { AlertRepository } from "@/server/repositories/alert.repository"
import { EmailSenderService } from "@/server/services/email-sender.service"

/**
 * Servicio de notificaciones
 * Lógica de negocio para el manejo de notificaciones en tiempo real y persistentes
 */
export class NotificationService {

  /**
   * Envía notificación de nueva alerta con escalación automática
   */
  static async broadcastNewAlert(alert: AlertWithRelations): Promise<void> {
    try {
      const { broadcastToAll } = await import('@/app/api/alerts-notifications/stream/route')

      broadcastToAll({
        type: 'new_alert',
        alert: alert
      })

      await this.createNotificationsForAlert(alert)

      console.log('Real-time notification sent for new alert:', alert.id)
    } catch (error) {
      console.error('Error sending real-time notification:', error)
    }
  }

  /**
   * Envía notificación de actualización de alerta
   */
  static async broadcastAlertUpdate(alert: AlertWithRelations): Promise<void> {
    try {
      const { broadcastToAll } = await import('@/app/api/alerts-notifications/stream/route')

      broadcastToAll({
        type: 'alert_updated',
        alert: alert
      })

      await this.createNotificationsForAlert(alert)

      console.log('Real-time notification sent for alert update:', alert.id)
    } catch (error) {
      console.error('Error sending real-time notification:', error)
    }
  }

  /**
   * Envía notificación a un usuario específico
   */
  static async broadcastToUser(userId: string, data: unknown): Promise<void> {
    try {
      const { broadcastToUser } = await import('@/app/api/alerts-notifications/stream/route')

      broadcastToUser(userId, data)

      console.log('Real-time notification sent to user:', userId)
    } catch (error) {
      console.error('Error sending user notification:', error)
    }
  }

  /**
   * Determina qué usuarios deben recibir notificación de una alerta
   * Incluye escalación automática basada en prioridad y permisos
   */
  static async getUsersToNotify(alert: AlertWithRelations): Promise<NotificationRecipient[]> {
    const recipients: NotificationRecipient[] = []

    // 1. Notificar al usuario que reportó
    if (alert.reportedById) {
      recipients.push({
        userId: alert.reportedById,
        type: "in_app",
        reason: "reporter"
      })
    }

    // 2. Notificar al usuario asignado
    if (alert.assignedToId) {
      recipients.push({
        userId: alert.assignedToId,
        type: "in_app",
        reason: "assignee"
      })
    }

    // 3. Escalación basada en prioridad y permisos
    const escalationRule = ESCALATION_RULES[alert.priority]

    if (escalationRule.notifyPermissions.length > 0) {
      const companyId = alert.site.clientCompany.id
      const escalationUsers = await UserRepository.findByPermissionsAndCompany(
        escalationRule.notifyPermissions,
        companyId
      )

      for (const user of escalationUsers) {
        const reason: NotificationReason =
          alert.priority === "CRITICAL" ? "admin_escalation" : "supervisor_escalation"

        for (const notificationType of escalationRule.notificationTypes) {
          recipients.push({
            userId: user.id,
            type: notificationType,
            reason
          })
        }
      }
    }

    return recipients
  }

  /**
   * Crea notificaciones persistentes para una alerta
   */
  static async createNotificationsForAlert(
    alert: AlertWithRelations
  ): Promise<number> {
    try {
      const recipients = await this.getUsersToNotify(alert)

      if (recipients.length === 0) {
        return 0
      }

      const notificationsData: Prisma.AlertNotificationCreateManyInput[] = recipients.map(
        (recipient) => ({
          alertId: alert.id,
          userId: recipient.userId,
          type: recipient.type,
          status: "pending",
          metadata: JSON.stringify({
            reason: recipient.reason,
            priority: alert.priority,
            alertTitle: alert.title
          })
        })
      )

      const count = await AlertNotificationRepository.createMany(notificationsData)

      console.log(`Created ${count} notifications for alert ${alert.id}`)

      return count
    } catch (error) {
      console.error('Error creating notifications for alert:', error)
      return 0
    }
  }

  /**
   * Procesa notificaciones pendientes (para workers/cron jobs)
   * Envía emails usando los templates configurados en la base de datos
   */
  static async processPendingNotifications(limit: number = 100): Promise<number> {
    try {
      const pending = await AlertNotificationRepository.findPending(limit)

      let processed = 0

      for (const notification of pending) {
        try {
          if (notification.type === "email") {
            const metadata = notification.metadata
              ? JSON.parse(notification.metadata)
              : {}

            const alert = await AlertRepository.findById(notification.alertId)

            if (!alert) {
              await AlertNotificationRepository.markAsFailed(
                notification.id,
                "Alert not found"
              )
              continue
            }

            const user = await UserRepository.findById(notification.userId)

            if (!user || !user.email) {
              await AlertNotificationRepository.markAsFailed(
                notification.id,
                "User not found or no email"
              )
              continue
            }

            const escalationReason = metadata.reason === "admin_escalation"
              ? `Esta alerta fue escalada automáticamente debido a su prioridad ${metadata.priority}`
              : `Esta alerta requiere su atención como supervisor`

            const alertUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/alerts/${alert.id}`

            const result = await EmailSenderService.sendAlertEscalatedEmail(
              user.email,
              alert.title,
              alert.description,
              alert.type,
              alert.priority,
              alert.site.name,
              alert.location || "No especificada",
              alert.reportedBy.name,
              alert.reportedAt.toLocaleString("es-CR", {
                dateStyle: "short",
                timeStyle: "short"
              }),
              escalationReason,
              alertUrl,
              alert.site.clientCompany.id
            )

            if (result.success) {
              await AlertNotificationRepository.markAsSent(notification.id)
            } else {
              await AlertNotificationRepository.markAsFailed(
                notification.id,
                result.error || "Unknown error"
              )
            }
          } else {
            await AlertNotificationRepository.markAsDelivered(notification.id)
          }

          processed++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          await AlertNotificationRepository.markAsFailed(
            notification.id,
            errorMessage
          )
        }
      }

      return processed
    } catch (error) {
      console.error('Error processing pending notifications:', error)
      return 0
    }
  }
}