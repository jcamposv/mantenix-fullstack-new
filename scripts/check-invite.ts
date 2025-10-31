import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking invitation for jairo+01@mantenix.com...\n')

  // Get the invitation
  const invitation = await prisma.userInvitation.findFirst({
    where: {
      email: 'jairo+01@mantenix.com'
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
    console.log('❌ No invitation found for jairo+01@mantenix.com')
    return
  }

  console.log('📧 Invitation found:')
  console.log('   ID:', invitation.id)
  console.log('   Email:', invitation.email)
  console.log('   Role:', invitation.role)
  console.log('   Company ID:', invitation.companyId || 'NULL')
  console.log('   Company Name:', invitation.company?.name || 'N/A')
  console.log('   Created By:', invitation.creator?.email || 'N/A')
  console.log('   Created At:', invitation.createdAt)
  console.log('   Used:', invitation.used)
  console.log('')

  // Check if company has email configuration
  if (invitation.companyId) {
    console.log('🔧 Checking email configuration...')
    const emailConfig = await prisma.emailConfiguration.findFirst({
      where: {
        companyId: invitation.companyId
      }
    })

    if (!emailConfig) {
      console.log('❌ No email configuration found for this company!')
      console.log('   Solution: Create an email configuration in the admin panel')
      return
    }

    console.log('✅ Email configuration found:')
    console.log('   ID:', emailConfig.id)
    console.log('   From Email:', emailConfig.fromEmail)
    console.log('   From Name:', emailConfig.fromName)
    console.log('   Is Active:', emailConfig.isActive)
    console.log('')

    if (!emailConfig.isActive) {
      console.log('⚠️  Email configuration is INACTIVE!')
      console.log('   Solution: Activate the email configuration')
      return
    }

    // Check if USER_INVITATION template exists
    console.log('📝 Checking USER_INVITATION template...')
    const template = await prisma.emailTemplate.findFirst({
      where: {
        emailConfigurationId: emailConfig.id,
        type: 'USER_INVITATION'
      }
    })

    if (!template) {
      console.log('❌ No USER_INVITATION template found!')
      console.log('   Solution: Create a USER_INVITATION template in the admin panel')
      return
    }

    console.log('✅ Template found:')
    console.log('   ID:', template.id)
    console.log('   Name:', template.name)
    console.log('   Subject:', template.subject)
    console.log('   Template ID (MailerSend):', template.templateId || 'NULL')
    console.log('   Is Active:', template.isActive)
    console.log('')

    if (!template.isActive) {
      console.log('⚠️  Template is INACTIVE!')
      console.log('   Solution: Activate the template')
      return
    }

    if (!template.templateId) {
      console.log('⚠️  Template has no MailerSend Template ID!')
      console.log('   Solution: Set the templateId from your MailerSend account')
      return
    }

    console.log('✅ Everything looks configured correctly!')
    console.log('')
    console.log('🤔 If the email still didn\'t arrive, check:')
    console.log('   1. MailerSend dashboard for delivery status')
    console.log('   2. Spam folder')
    console.log('   3. MailerSend API token permissions')
    console.log('   4. Server logs for any errors during email send')

  } else {
    console.log('❌ Invitation has no companyId!')
    console.log('   This user was invited without a company.')
    console.log('   Super Admin invitations require a company to send emails.')
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
