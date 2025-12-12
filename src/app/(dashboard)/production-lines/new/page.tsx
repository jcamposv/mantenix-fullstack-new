import { AuthService } from '@/server/services/auth.service'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateProductionLineForm } from '@/components/production-lines/create-production-line-form'
import { prisma } from '@/lib/prisma'
import { getCurrentCompanyId } from '@/lib/company-context'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

/**
 * Create New Production Line Page
 */
export default async function NewProductionLinePage() {
  const sessionResult = await AuthService.getAuthenticatedSession()
  
  // Type guard: redirect if not authenticated
  if (sessionResult instanceof NextResponse) {
    redirect('/login')
  }
  
  const companyId = await getCurrentCompanyId(sessionResult)

  if (!companyId) {
    throw new Error('No se pudo determinar la empresa')
  }

  // Check if company has EXTERNAL_CLIENT_MANAGEMENT feature
  const hasExternalClientsFeature = await prisma.companyFeature.findFirst({
    where: {
      companyId,
      module: 'EXTERNAL_CLIENT_MANAGEMENT',
      isEnabled: true,
    },
  })

  // If company doesn't have external clients feature, ensure internal client exists
  if (!hasExternalClientsFeature) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    })

    if (company) {
      // Check if internal client exists
      let internalClient = await prisma.clientCompany.findFirst({
        where: {
          tenantCompanyId: companyId,
          name: { contains: 'Operaciones Internas', mode: 'insensitive' },
        },
      })

      // If not, create internal client and default site
      if (!internalClient) {
        internalClient = await prisma.clientCompany.create({
          data: {
            name: `${company.name} - Operaciones Internas`,
            tenantCompanyId: companyId,
            createdBy: sessionResult.user.id,
            isActive: true,
          },
        })

        // Create default "Sede Central" site
        await prisma.site.create({
          data: {
            name: 'Sede Central',
            clientCompanyId: internalClient.id,
            createdBy: sessionResult.user.id,
            isActive: true,
          },
        })
      } else {
        // Check if "Sede Central" exists for this internal client
        const centralSite = await prisma.site.findFirst({
          where: {
            clientCompanyId: internalClient.id,
            name: { contains: 'Sede Central', mode: 'insensitive' },
          },
        })

        // If not, create it
        if (!centralSite) {
          await prisma.site.create({
            data: {
              name: 'Sede Central',
              clientCompanyId: internalClient.id,
              createdBy: sessionResult.user.id,
              isActive: true,
            },
          })
        }
      }
    }
  }

  // Fetch all sites for the company (both internal and external clients)
  const sites = await prisma.site.findMany({
    where: {
      clientCompany: {
        tenantCompanyId: companyId,
      },
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      clientCompany: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      {
        clientCompany: {
          name: 'asc',
        },
      },
      {
        name: 'asc',
      },
    ],
  })

  // If no sites exist, show helpful message
  if (sites.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/production-lines">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Nueva Línea de Producción</h1>
              <p className="text-muted-foreground">
                Crea una nueva línea de producción para tu empresa
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No hay sedes disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Para crear una línea de producción, primero debes crear al menos una sede.
            </p>
            <Button asChild>
              <Link href="/admin/client-companies">
                Ir a Gestión de Clientes y Sedes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/production-lines">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nueva Línea de Producción</h1>
            <p className="text-muted-foreground">
              Crea una nueva línea de producción para tu empresa
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Línea</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateProductionLineForm sites={sites} />
        </CardContent>
      </Card>
    </div>
  )
}
