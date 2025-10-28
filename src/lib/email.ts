/**
 * Email service using the template system
 */

import { EmailSenderService } from "@/server/services/email-sender.service"

interface InviteEmailData {
  recipientEmail: string
  recipientName: string
  inviterName: string
  companyName: string
  role: string
  inviteLink: string
  companyId: string
}

export async function sendInviteEmail(data: InviteEmailData) {
  try {
    const expirationDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short'
    })

    const result = await EmailSenderService.sendInvitationEmail(
      data.recipientEmail,
      data.recipientName,
      data.inviterName,
      data.companyName,
      data.inviteLink,
      expirationDate,
      data.companyId
    )

    if (!result.success) {
      throw new Error(result.error || 'Failed to send invitation email')
    }

    console.log('Invite email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }

  } catch (error) {
    console.error('Error sending invite email:', error)
    throw new Error('Failed to send invitation email')
  }
}

export async function sendWelcomeEmail(data: {
  recipientEmail: string
  recipientName: string
  companyName: string
  loginUrl: string
  companyId: string
}) {
  try {
    const result = await EmailSenderService.sendWelcomeEmail(
      data.recipientEmail,
      data.recipientName,
      data.companyName,
      data.loginUrl,
      data.companyId
    )

    if (!result.success) {
      throw new Error(result.error || 'Failed to send welcome email')
    }

    console.log('Welcome email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }

  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw new Error('Failed to send welcome email')
  }
}