import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"
import { EmailConfigurationRepository } from "../repositories/email-configuration.repository"
import { EmailTemplateRepository } from "../repositories/email-template.repository"
import { CompanyRepository } from "../repositories/company.repository"
import type {
  SendEmailData,
  EmailSendResponse,
} from "@/types/email.types"

export class EmailSenderService {

  static async sendEmail(data: SendEmailData): Promise<EmailSendResponse> {
    try {
      const emailConfig = await EmailConfigurationRepository.findByCompanyId(data.companyId)
      if (!emailConfig || !emailConfig.isActive) {
        throw new Error("No hay configuración de email activa para esta empresa")
      }

      const template = await EmailTemplateRepository.findByConfigurationAndType(
        emailConfig.id,
        data.templateType
      )
      if (!template || !template.isActive) {
        throw new Error(`No hay template activo para el tipo: ${data.templateType}`)
      }

      const mailerSend = new MailerSend({
        apiKey: emailConfig.apiToken,
      })

      const sentFrom = new Sender(emailConfig.fromEmail, emailConfig.fromName)

      const recipients = Array.isArray(data.to)
        ? data.to.map(email => new Recipient(email))
        : [new Recipient(data.to)]

      const company = await CompanyRepository.findById(data.companyId)
      const brandingVars: Record<string, string> = {}
      if (company) {
        brandingVars["brand_name"] = company.name
        if (company.logo) brandingVars["brand_logo_url"] = company.logo
        if (company.logoSmall) brandingVars["brand_logo_small_url"] = company.logoSmall
        if (company.primaryColor) brandingVars["brand_primary_color"] = company.primaryColor
        if (company.secondaryColor) brandingVars["brand_secondary_color"] = company.secondaryColor
        if (company.backgroundColor) brandingVars["brand_background_color"] = company.backgroundColor
        if (company.customFont) brandingVars["brand_font"] = company.customFont
      }
      if (data.brandingOverride) {
        if (data.brandingOverride.brandName) brandingVars["brand_name"] = data.brandingOverride.brandName
        if (data.brandingOverride.logoUrl) brandingVars["brand_logo_url"] = data.brandingOverride.logoUrl
        if (data.brandingOverride.logoSmallUrl) brandingVars["brand_logo_small_url"] = data.brandingOverride.logoSmallUrl
        if (data.brandingOverride.primaryColor) brandingVars["brand_primary_color"] = data.brandingOverride.primaryColor
        if (data.brandingOverride.secondaryColor) brandingVars["brand_secondary_color"] = data.brandingOverride.secondaryColor
        if (data.brandingOverride.backgroundColor) brandingVars["brand_background_color"] = data.brandingOverride.backgroundColor
        if (data.brandingOverride.font) brandingVars["brand_font"] = data.brandingOverride.font
      }
      const mergedVariables = { ...brandingVars, ...data.variables }
    
      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(this.replaceVariables(template.subject, mergedVariables))

      if (emailConfig.replyToEmail) {
        emailParams.setReplyTo(new Sender(emailConfig.replyToEmail))
      }

      if (template.templateId) {
        emailParams.setTemplateId(template.templateId)

        const personalization = recipients.map(recipient => ({
          email: recipient.email,
          data: mergedVariables
        }))
        emailParams.setPersonalization(personalization)
      }

      if (data.cc) {
        const ccRecipients = Array.isArray(data.cc)
          ? data.cc.map(email => new Recipient(email))
          : [new Recipient(data.cc)]
        emailParams.setCc(ccRecipients)
      }

      if (data.bcc) {
        const bccRecipients = Array.isArray(data.bcc)
          ? data.bcc.map(email => new Recipient(email))
          : [new Recipient(data.bcc)]
        emailParams.setBcc(bccRecipients)
      }

      if (data.attachments && data.attachments.length > 0) {
        const attachments = data.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          disposition: 'attachment' as const
        }))
        emailParams.setAttachments(attachments)
      }

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


  static async sendInvitationEmail(
    to: string,
    userName: string,
    inviterName: string,
    companyName: string,
    invitationLink: string,
    expirationDate: string,
    companyId: string,
    brandingOverride?: {
      brandName?: string
      logoUrl?: string
      logoSmallUrl?: string
      primaryColor?: string
      secondaryColor?: string
      backgroundColor?: string
      font?: string
    }
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
      companyId,
      brandingOverride
    })
  }

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

  static async sendPasswordResetEmail(
    to: string,
    userName: string,
    adminName: string,
    companyName: string,
    resetLink: string,
    expirationDate: string,
    companyId: string
  ): Promise<EmailSendResponse> {
    return await this.sendEmail({
      to,
      templateType: 'PASSWORD_RESET',
      variables: {
        user_name: userName,
        user_email: to,
        admin_name: adminName,
        company_name: companyName,
        reset_link: resetLink,
        expiration_date: expirationDate
      },
      companyId
    })
  }

  static async sendAlertEscalatedEmail(
    to: string | string[],
    alertTitle: string,
    alertDescription: string,
    alertType: string,
    alertPriority: string,
    siteName: string,
    location: string,
    reportedByName: string,
    reportedAt: string,
    escalationReason: string,
    alertUrl: string,
    companyId: string
  ): Promise<EmailSendResponse> {
    return await this.sendEmail({
      to,
      templateType: 'ALERT_ESCALATED',
      variables: {
        alert_title: alertTitle,
        alert_description: alertDescription,
        alert_type: alertType,
        alert_priority: alertPriority,
        site_name: siteName,
        location: location || 'No especificada',
        reported_by_name: reportedByName,
        reported_at: reportedAt,
        escalation_reason: escalationReason,
        alert_url: alertUrl
      },
      companyId
    })
  }
}
