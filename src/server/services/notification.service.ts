import type { AlertWithRelations } from "@/types/alert.types"

/**
 * Servicio de notificaciones
 * Lógica de negocio para el manejo de notificaciones en tiempo real
 */
export class NotificationService {
  
  /**
   * Envía notificación de nueva alerta
   */
  static async broadcastNewAlert(alert: AlertWithRelations) {
    try {
      const { broadcastToAll } = await import('@/app/api/alerts-notifications/stream/route')
      
      broadcastToAll({
        type: 'new_alert',
        alert: alert
      })
      
      console.log('Real-time notification sent for new alert:', alert.id)
    } catch (error) {
      console.error('Error sending real-time notification:', error)
    }
  }

  /**
   * Envía notificación de actualización de alerta
   */
  static async broadcastAlertUpdate(alert: AlertWithRelations) {
    try {
      const { broadcastToAll } = await import('@/app/api/alerts-notifications/stream/route')
      
      broadcastToAll({
        type: 'alert_updated',
        alert: alert
      })
      
      console.log('Real-time notification sent for alert update:', alert.id)
    } catch (error) {
      console.error('Error sending real-time notification:', error)
    }
  }

  /**
   * Envía notificación a un usuario específico
   */
  static async broadcastToUser(userId: string, data: unknown) {
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
   */
  static getUsersToNotify(alert: AlertWithRelations): string[] {
    const usersToNotify: string[] = []

    // Notificar al usuario que reportó
    if (alert.reportedById) {
      usersToNotify.push(alert.reportedById)
    }

    // Notificar al usuario asignado
    if (alert.assignedToId) {
      usersToNotify.push(alert.assignedToId)
    }

    // TODO: Agregar lógica para notificar a supervisores, admins, etc.
    // basado en la prioridad de la alerta y las reglas de negocio

    return [...new Set(usersToNotify)] // Remover duplicados
  }
}