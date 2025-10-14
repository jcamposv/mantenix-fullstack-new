/**
 * Email service using MailerSend for user invitations
 */

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
})

const sentFrom = new Sender(
  process.env.EMAIL_FROM || "noreply@mantenix.ai",
  process.env.EMAIL_FROM_NAME || "Mantenix Platform"
)

interface InviteEmailData {
  recipientEmail: string
  recipientName: string
  inviterName: string
  companyName: string
  role: string
  inviteLink: string
}

export async function sendInviteEmail(data: InviteEmailData) {
  try {
    const recipients = [
      new Recipient(data.recipientEmail, data.recipientName)
    ]

    const personalization = [
      {
        email: data.recipientEmail,
        data: {
          name: data.recipientName,
          account: {
            name: data.inviterName
          },
          company_name: data.companyName,
          link_register: data.inviteLink,
          role: data.role
        },
      }
    ]

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`Invitation to join ${data.companyName} on Mantenix`)
      .setTemplateId(process.env.MAILERSEND_INVITE_TEMPLATE_ID!)
      .setPersonalization(personalization)

    const response = await mailerSend.email.send(emailParams)
    
    console.log('Invite email sent successfully:', response)
    return { success: true, messageId: response }
    
  } catch (error) {
    console.error('Error sending invite email:', error)
    throw new Error('Failed to send invitation email')
  }
}

export async function sendWelcomeEmail(data: {
  recipientEmail: string
  recipientName: string
  companyName: string
}) {
  // TODO: Implement welcome email after user completes registration
  console.log('Welcome email would be sent to:', data.recipientEmail)
}