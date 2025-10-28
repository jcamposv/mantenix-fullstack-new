import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"
import { EmailConfigurationRepository } from "../repositories/email-configuration.repository"
import { EmailTemplateRepository } from "../repositories/email-template.repository"
import type {
  SendEmailData,
  EmailSendResponse,
} from "@/types/email.types"

/**
 * Servicio para enviar emails a través de MailerSend
 */
export class EmailSenderService {

  /**
   * Envía un email usando un template configurado
   */
  static async sendEmail(data: SendEmailData): Promise<EmailSendResponse> {
    try {
      // Obtener la configuración de email de la company
      const emailConfig = await EmailConfigurationRepository.findByCompanyId(data.companyId)
      if (!emailConfig || !emailConfig.isActive) {
        throw new Error("No hay configuración de email activa para esta empresa")
      }

      // Obtener el template correspondiente
      const template = await EmailTemplateRepository.findByConfigurationAndType(
        emailConfig.id,
        data.templateType
      )
      if (!template || !template.isActive) {
        throw new Error(`No hay template activo para el tipo: ${data.templateType}`)
      }

      // Inicializar MailerSend con el API token de la configuración
      const mailerSend = new MailerSend({
        apiKey: emailConfig.apiToken,
      })

      // Configurar remitente
      const sentFrom = new Sender(emailConfig.fromEmail, emailConfig.fromName)

      // Configurar destinatarios
      const recipients = Array.isArray(data.to)
        ? data.to.map(email => new Recipient(email))
        : [new Recipient(data.to)]

      // Crear EmailParams
      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(this.replaceVariables(template.subject, data.variables))

      // Configurar reply-to si existe
      if (emailConfig.replyToEmail) {
        emailParams.setReplyTo(new Sender(emailConfig.replyToEmail))
      }

      // Si el template usa un templateId de MailerSend
      if (template.templateId) {
        emailParams.setTemplateId(template.templateId)

        // Agregar personalización con variables
        const personalization = recipients.map(recipient => ({
          email: recipient.email,
          data: data.variables
        }))
        emailParams.setPersonalization(personalization)
      }

      // Agregar CC si existe
      if (data.cc) {
        const ccRecipients = Array.isArray(data.cc)
          ? data.cc.map(email => new Recipient(email))
          : [new Recipient(data.cc)]
        emailParams.setCc(ccRecipients)
      }

      // Agregar BCC si existe
      if (data.bcc) {
        const bccRecipients = Array.isArray(data.bcc)
          ? data.bcc.map(email => new Recipient(email))
          : [new Recipient(data.bcc)]
        emailParams.setBcc(bccRecipients)
      }

      // Agregar attachments si existen
      if (data.attachments && data.attachments.length > 0) {
        const attachments = data.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          disposition: 'attachment' as const
        }))
        emailParams.setAttachments(attachments)
      }

      // Enviar el email
      const response = await mailerSend.email.send(emailParams)

      return {
        success: true,
        messageId: response.body.message_id || response.statusCode.toString()
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Reemplaza variables en el contenido
   * Formato: {{variable_name}}
   */
  private static replaceVariables(
    content: string,
    variables: Record<string, string | number | boolean>
  ): string {
    let result = content

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      result = result.replace(regex, String(value))
    }

    return result
  }

  /**
   * Envía un email de bienvenida
   */
  static async sendWelcomeEmail(
    to: string,
    userName: string,
    companyName: string,
    loginUrl: string,
    companyId: string
  ): Promise<EmailSendResponse> {
    return await this.sendEmail({
      to,
      templateType: 'WELCOME',
      variables: {
        user_name: userName,
        user_email: to,
        company_name: companyName,
        login_url: loginUrl
      },
      companyId
    })
  }

  /**
   * Envía un email de invitación de usuario
   */
  static async sendInvitationEmail(
    to: string,
    userName: string,
    inviterName: string,
    companyName: string,
    invitationLink: string,
    expirationDate: string,
    companyId: string
  ): Promise<EmailSendResponse> {
    return await this.sendEmail({
      to,
      templateType: 'USER_INVITATION',
      variables: {
        user_name: userName,
        user_email: to,
        inviter_name: inviterName,
        company_name: companyName,
        link_register: invitationLink,
        expiration_date: expirationDate
      },
      companyId
    })
  }

  /**
   * Envía un email de orden de trabajo creada
   */
  static async sendWorkOrderCreatedEmail(
    to: string | string[],
    workOrderNumber: string,
    workOrderTitle: string,
    workOrderDescription: string,
    workOrderType: string,
    workOrderPriority: string,
    workOrderStatus: string,
    siteName: string,
    scheduledDate: string,
    createdByName: string,
    workOrderUrl: string,
    companyId: string
  ): Promise<EmailSendResponse> {
    return await this.sendEmail({
      to,
      templateType: 'WORK_ORDER_CREATED',
      variables: {
        work_order_number: workOrderNumber,
        work_order_title: workOrderTitle,
        work_order_description: workOrderDescription,
        work_order_type: workOrderType,
        work_order_priority: workOrderPriority,
        work_order_status: workOrderStatus,
        site_name: siteName,
        scheduled_date: scheduledDate,
        created_by_name: createdByName,
        work_order_url: workOrderUrl
      },
      companyId
    })
  }

  /**
   * Envía un email de orden de trabajo completada
   */
  static async sendWorkOrderCompletedEmail(
    to: string | string[],
    workOrderNumber: string,
    workOrderTitle: string,
    workOrderDescription: string,
    workOrderType: string,
    workOrderPriority: string,
    workOrderStatus: string,
    siteName: string,
    completedByName: string,
    completedAt: string,
    workOrderUrl: string,
    companyId: string
  ): Promise<EmailSendResponse> {
    return await this.sendEmail({
      to,
      templateType: 'WORK_ORDER_COMPLETED',
      variables: {
        work_order_number: workOrderNumber,
        work_order_title: workOrderTitle,
        work_order_description: workOrderDescription,
        work_order_type: workOrderType,
        work_order_priority: workOrderPriority,
        work_order_status: workOrderStatus,
        site_name: siteName,
        created_by_name: completedByName,
        scheduled_date: completedAt,
        work_order_url: workOrderUrl
      },
      companyId
    })
  }

  /**
   * Envía un email de alerta creada
   */
  static async sendAlertCreatedEmail(
    to: string | string[],
    alertTitle: string,
    alertDescription: string,
    alertType: string,
    alertPriority: string,
    siteName: string,
    location: string,
    reportedByName: string,
    reportedAt: string,
    alertUrl: string,
    companyId: string
  ): Promise<EmailSendResponse> {
    return await this.sendEmail({
      to,
      templateType: 'ALERT_CREATED',
      variables: {
        alert_title: alertTitle,
        alert_description: alertDescription,
        alert_type: alertType,
        alert_priority: alertPriority,
        site_name: siteName,
        location: location,
        reported_by_name: reportedByName,
        reported_at: reportedAt,
        alert_url: alertUrl
      },
      companyId
    })
  }
}
