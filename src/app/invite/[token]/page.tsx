import { InvitePageClient } from "./invite-page-client"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { CompanyBranding } from "@/types/branding"

async function getCompanyBranding(): Promise<CompanyBranding | null> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const subdomain = host.split('.')[0]
    
    // Only fetch if we have a subdomain (not just localhost or main domain)
    if (subdomain && subdomain !== 'localhost' && subdomain !== host) {
      const company = await prisma.company.findUnique({
        where: { 
          subdomain: subdomain,
          isActive: true 
        },
        select: {
          name: true,
          logo: true,
          logoSmall: true,
          primaryColor: true,
          secondaryColor: true,
          backgroundColor: true,
        }
      })

      return company
    }
    
    return null
  } catch (error) {
    console.warn('Failed to fetch company branding:', error)
    return null
  }
}

export default async function AcceptInvitePage() {
  const companyBranding = await getCompanyBranding()
  
  return <InvitePageClient initialCompanyBranding={companyBranding} />
}