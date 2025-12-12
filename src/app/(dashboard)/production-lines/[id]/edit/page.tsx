import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'
import { prisma } from '@/lib/prisma'
import { getCurrentCompanyId } from '@/lib/company-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Settings, Workflow } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductionLineEditor } from '@/components/production-lines/production-line-editor'
import { EditProductionLineForm } from '@/components/production-lines/edit-production-line-form'
import { notFound, redirect } from 'next/navigation'

interface EditProductionLinePageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Edit Production Line Page
 * Interactive React Flow editor for building production lines
 */
export default async function EditProductionLinePage({
  params,
}: EditProductionLinePageProps) {
  const { id } = await params
  const sessionResult = await AuthService.getAuthenticatedSession()
  
  // Type guard: redirect if not authenticated
  if ('status' in sessionResult) {
    redirect('/login')
  }
  
  const session = sessionResult
  const companyId = await getCurrentCompanyId(session)

  if (!companyId) {
    throw new Error('No se pudo determinar la empresa')
  }

  // Fetch production line
  const productionLine = await ProductionLineService.getProductionLineById(
    session,
    id
  )

  if (!productionLine) {
    notFound()
  }

  // Fetch available assets for this company
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

  // Fetch available assets to add to the line
  const availableAssets = await prisma.asset.findMany({
    where: {
      site: {
        clientCompany: {
          tenantCompanyId: companyId,
        },
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      location: true,
      manufacturer: true,
      model: true,
      siteId: true,
      site: {
        select: {
          name: true,
        },
      },
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
            <Link href={`/production-lines/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Línea de Producción</h1>
            <p className="text-muted-foreground">
              {productionLine.name} ({productionLine.code})
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for Basic Info and Visual Diagram */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">
            <Settings className="mr-2 h-4 w-4" />
            Información Básica
          </TabsTrigger>
          <TabsTrigger value="diagram">
            <Workflow className="mr-2 h-4 w-4" />
            Diagrama Visual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Línea</CardTitle>
            </CardHeader>
            <CardContent>
              <EditProductionLineForm
                productionLine={productionLine}
                sites={sites}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagram">
          <Card>
            <CardHeader>
              <CardTitle>Editor de Línea de Producción</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ProductionLineEditor
                productionLine={productionLine}
                sites={sites}
                availableAssets={availableAssets}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
