import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { AuthService } from "@/server/services/auth.service"
import { WorkOrderService } from "@/server/services/work-order.service"
import { WorkOrderDetailClient } from "@/components/work-orders/work-order-detail-client"
import type { CompanyBranding } from "@/types/branding"

export const dynamic = 'force-dynamic'

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

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkOrderDetailPage({ params }: PageProps) {
  const { id } = await params

  // Get authenticated session
  const sessionResult = await AuthService.getAuthenticatedSession()
  if (!sessionResult || sessionResult instanceof Response) {
    notFound()
  }

  // Fetch work order and company branding in parallel
  const [workOrder, companyBranding] = await Promise.all([
    WorkOrderService.getWorkOrderById(sessionResult, id),
    getCompanyBranding()
  ])

  if (!workOrder) {
    notFound()
  }

  const companyInfo = companyBranding ? {
    name: companyBranding.name,
    logo: companyBranding.logo ?? null
  } : undefined

  return <WorkOrderDetailClient workOrder={workOrder} companyInfo={companyInfo} />
}
