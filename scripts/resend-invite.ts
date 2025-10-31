/**
 * Resend invitation email and show detailed error logs
 */
import { PrismaClient } from '@prisma/client'
import { EmailSenderService } from '../src/server/services/email-sender.service'

const prisma = new PrismaClient()

async function main() {
  const email = 'jairo+01@mantenix.com'

  console.log('🔍 Finding invitation...\n')

  // Get the invitation
  const invitation = await prisma.userInvitation.findFirst({
    where: {
      email
    },
    include: {
      company: true,
      creator: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (!invitation) {
    console.log('❌ No invitation found for', email)
    return
  }

  console.log('📧 Found invitation:')
  console.log('   Email:', invitation.email)
  console.log('   Role:', invitation.role)
  console.log('   Company:', invitation.company?.name)
  console.log('   Company ID:', invitation.companyId)
  console.log('')

  if (!invitation.companyId) {
    console.log('❌ Invitation has no companyId, cannot send email')
    return
  }

  // Build invitation link
  const company = invitation.company
  let inviteLink
  if (company?.subdomain) {
    const domainBase = process.env.DOMAIN_BASE || "mantenix.ai"
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${company.subdomain}.${domainBase}`
      : `http://${company.subdomain}.localhost:3000`
    inviteLink = `${baseUrl}/invite/${invitation.token}`
  } else {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    inviteLink = `${baseUrl}/invite/${invitation.token}`
  }

  console.log('🔗 Invite link:', inviteLink)
  console.log('')

  // Prepare email data
  const expirationDate = new Date(invitation.expiresAt).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short'
  })

  console.log('📤 Attempting to send email...\n')
  console.log('Variables:')
  console.log('   user_name:', invitation.email)
  console.log('   user_email:', invitation.email)
  console.log('   inviter_name:', invitation.creator?.name || 'Administrator')
  console.log('   company_name:', company?.name || 'Mantenix')
  console.log('   link_register:', inviteLink)
  console.log('   expiration_date:', expirationDate)
  console.log('')

  try {
    const result = await EmailSenderService.sendInvitationEmail(
      invitation.email,
      invitation.email, // userName
      invitation.creator?.name || 'Administrator',
      company?.name || 'Mantenix',
      inviteLink,
      expirationDate,
      invitation.companyId
    )

    if (result.success) {
      console.log('✅ Email sent successfully!')
      console.log('   Message ID:', result.messageId)
      console.log('')
      console.log('📬 Check:')
      console.log('   1. Inbox of', email)
      console.log('   2. Spam folder')
      console.log('   3. MailerSend dashboard for delivery status')
    } else {
      console.log('❌ Email send failed!')
      console.log('   Error:', result.error)
    }

  } catch (error) {
    console.log('❌ Error sending email:')
    console.log('')

    if (error instanceof Error) {
      console.log('Error message:', error.message)
      console.log('')
      console.log('Full error:')
      console.log(error)
    } else {
      console.log(error)
    }

    console.log('')
    console.log('🔧 Common issues:')
    console.log('   1. MailerSend API token is invalid or expired')
    console.log('   2. Template ID does not exist in MailerSend')
    console.log('   3. Template variables don\'t match')
    console.log('   4. From email is not verified in MailerSend')
    console.log('   5. API rate limit exceeded')
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Script error:', e)
    prisma.$disconnect()
    process.exit(1)
  })
