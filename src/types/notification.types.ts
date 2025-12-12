import type { AlertNotification, AlertPriority, User } from "@prisma/client"

/**
 * Notification escalation types
 */

export interface NotificationRecipient {
  userId: string
  type: NotificationType
  reason: NotificationReason
}

export type NotificationType = "email" | "push" | "in_app"

export type NotificationReason =
  | "reporter" // Usuario que reportó la alerta
  | "assignee" // Usuario asignado a la alerta
  | "supervisor_escalation" // Escalado a supervisor por prioridad
  | "admin_escalation" // Escalado a admin por prioridad crítica
  | "status_change" // Cambio de estado de la alerta
  | "comment_added" // Nuevo comentario en la alerta

export interface EscalationRule {
  priority: AlertPriority
  notifyPermissions: string[] // Permission keys: ['alerts.view_company', 'work_orders.assign']
  notificationTypes: NotificationType[]
}

export interface AlertNotificationWithRelations extends AlertNotification {
  user: Pick<User, "id" | "name" | "email">
}

/**
 * Reglas de escalación por prioridad
 * Basado en permisos, no en roles fijos
 */
export const ESCALATION_RULES: Record<AlertPriority, EscalationRule> = {
  CRITICAL: {
    priority: "CRITICAL",
    // Notificar a usuarios con permisos de ver alertas de toda la empresa
    notifyPermissions: ["alerts.view_company", "alerts.update"],
    notificationTypes: ["email", "push", "in_app"]
  },
  HIGH: {
    priority: "HIGH",
    // Notificar a usuarios que pueden ver alertas de la empresa o asignar trabajo
    notifyPermissions: ["alerts.view_company", "work_orders.assign"],
    notificationTypes: ["push", "in_app"]
  },
  MEDIUM: {
    priority: "MEDIUM",
    // No escalar, solo notificar a asignado y reportador
    notifyPermissions: [],
    notificationTypes: ["in_app"]
  },
  LOW: {
    priority: "LOW",
    // No escalar, solo notificar a asignado y reportador
    notifyPermissions: [],
    notificationTypes: ["in_app"]
  }
}
