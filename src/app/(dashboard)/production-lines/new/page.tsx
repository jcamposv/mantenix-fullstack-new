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

  // Fetch sites for the dropdown
  const sites = await prisma.site.findMany({
    where: {
      clientCompany: {
        tenantCompanyId: companyId,
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

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
