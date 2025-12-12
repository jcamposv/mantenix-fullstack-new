import type { PaginatedResponse } from "@/types/common.types"

// Enum types from Prisma
export type EmailTemplateType =
  | "WELCOME"
  | "USER_INVITATION"
  | "WORK_ORDER_CREATED"
  | "WORK_ORDER_COMPLETED"
  | "WORK_ORDER_CANCELLED"
  | "ALERT_CREATED"
  | "ALERT_ASSIGNED"
  | "ALERT_RESOLVED"
  | "ALERT_ESCALATED"
  | "PASSWORD_RESET"

// Base EmailConfiguration interface
export interface EmailConfiguration {
  id: string
  companyId: string
  apiToken: string
  domainId: string | null
  fromEmail: string
  fromName: string
  replyToEmail: string | null
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// EmailConfiguration with relations
export interface EmailConfigurationWithRelations extends EmailConfiguration {
  company?: {
    id: string
    name: string
    subdomain: string
  } | null
  emailTemplates?: EmailTemplateWithRelations[]
  _count?: {
    emailTemplates?: number
  }
}

// Base EmailTemplate interface
export interface EmailTemplate {
  id: string
  emailConfigurationId: string
  type: EmailTemplateType
  name: string
  subject: string
  templateId: string | null
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// EmailTemplate with relations
export interface EmailTemplateWithRelations extends EmailTemplate {
  emailConfiguration?: {
    id: string
    companyId: string
    fromEmail: string
    fromName: string
    replyToEmail: string | null
    company: {
      id: string
      name: string
      subdomain: string
    }
  } | null
}

// Create email configuration data interface
export interface CreateEmailConfigurationData {
  companyId: string
  apiToken: string
  domainId?: string
  fromEmail: string
  fromName: string
  replyToEmail?: string
}

// Update email configuration data interface
export interface UpdateEmailConfigurationData {
  apiToken?: string
  domainId?: string
  fromEmail?: string
  fromName?: string
  replyToEmail?: string
  isActive?: boolean
}

// Create email template data interface
export interface CreateEmailTemplateData {
  emailConfigurationId: string
  type: EmailTemplateType
  name: string
  subject: string
  templateId?: string
}

// Update email template data interface
export interface UpdateEmailTemplateData {
  name?: string
  subject?: string
  templateId?: string
  isActive?: boolean
}

// Email template filters
export interface EmailTemplateFilters {
  emailConfigurationId?: string
  companyId?: string
  type?: EmailTemplateType
  isActive?: boolean
}

// Paginated response for email configurations
export type PaginatedEmailConfigurationsResponse = PaginatedResponse<EmailConfigurationWithRelations>

// Paginated response for email templates
export type PaginatedEmailTemplatesResponse = PaginatedResponse<EmailTemplateWithRelations>

// Email sending data
export interface SendEmailData {
  to: string | string[]
  templateType: EmailTemplateType
  variables: Record<string, string | number | boolean>
  companyId: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: EmailAttachment[]
}

// Email attachment
export interface EmailAttachment {
  filename: string
  content: string // Base64 encoded
  contentType: string
}

// Email send response
export interface EmailSendResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Available template variables by type
export const TEMPLATE_VARIABLES: Record<EmailTemplateType, string[]> = {
  WELCOME: [
    "user_name",
    "user_email",
    "company_name",
    "login_url"
  ],
  USER_INVITATION: [
    "user_name",
    "user_email",
    "inviter_name",
    "company_name",
    "link_register",
    "expiration_date"
  ],
  WORK_ORDER_CREATED: [
    "work_order_number",
    "work_order_title",
    "work_order_description",
    "work_order_type",
    "work_order_priority",
    "work_order_status",
    "site_name",
    "scheduled_date",
    "created_by_name",
    "work_order_url"
  ],
  WORK_ORDER_COMPLETED: [
    "work_order_number",
    "work_order_title",
    "work_order_description",
    "work_order_type",
    "work_order_priority",
    "work_order_status",
    "site_name",
    "created_by_name",
    "scheduled_date",
    "work_order_url"
  ],
  WORK_ORDER_CANCELLED: [
    "work_order_number",
    "work_order_title",
    "work_order_type",
    "site_name",
    "cancelled_by_name",
    "cancelled_at",
    "cancellation_reason",
    "work_order_url"
  ],
  ALERT_CREATED: [
    "alert_title",
    "alert_description",
    "alert_type",
    "alert_priority",
    "site_name",
    "location",
    "reported_by_name",
    "reported_at",
    "alert_url"
  ],
  ALERT_ASSIGNED: [
    "alert_title",
    "alert_type",
    "alert_priority",
    "site_name",
    "assigned_to_name",
    "assigned_by_name",
    "assigned_at",
    "alert_url"
  ],
  ALERT_RESOLVED: [
    "alert_title",
    "alert_type",
    "site_name",
    "resolved_by_name",
    "resolved_at",
    "resolution_notes",
    "alert_url"
  ],
  ALERT_ESCALATED: [
    "alert_title",
    "alert_description",
    "alert_type",
    "alert_priority",
    "site_name",
    "location",
    "reported_by_name",
    "reported_at",
    "escalation_reason",
    "alert_url"
  ],
  PASSWORD_RESET: [
    "user_name",
    "user_email",
    "admin_name",
    "company_name",
    "reset_link",
    "expiration_date"
  ]
}
