import { NewInventoryItemClient } from "./client"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

async function getCurrentCompanyId() {
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
          id: true
        }
      })

      return company?.id || null
    }

    return null
  } catch (error) {
    console.warn('Failed to fetch current company:', error)
    return null
  }
}

export default async function NewInventoryItemPage() {
  const currentCompanyId = await getCurrentCompanyId()

  return <NewInventoryItemClient currentCompanyId={currentCompanyId} />
}
