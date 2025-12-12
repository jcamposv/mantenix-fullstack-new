import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Settings, TrendingUp, BarChart3, ListOrdered } from 'lucide-react'
import { ProductionLineViewer } from '@/components/production-lines/production-line-viewer'
import { ProductionLineStats } from '@/components/production-lines/production-line-stats'
import { ProductionLineAssetsTable } from '@/components/production-lines/production-line-assets-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notFound, redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

interface ProductionLineDetailPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Production Line Detail Page
 * Shows React Flow visualization of the production line
 */
export default async function ProductionLineDetailPage({
  params,
}: ProductionLineDetailPageProps) {
  const { id } = await params
  const sessionResult = await AuthService.getAuthenticatedSession()
  
  // Type guard: redirect if not authenticated
  if (sessionResult instanceof NextResponse) {
    redirect('/login')
  }

  const productionLine = await ProductionLineService.getProductionLineById(
    sessionResult,
    id
  )

  if (!productionLine) {
    notFound()
  }

  // Calculate health percentage
  const totalAssets = productionLine._count?.assets || 0
  const operationalAssets =
    productionLine.assets?.filter((a) => a.asset.status === 'OPERATIVO')
      .length || 0
  const healthPercentage =
    totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 0

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/production-lines">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{productionLine.name}</h1>
              <Badge
                variant={healthPercentage >= 80 ? 'default' : healthPercentage >= 50 ? 'outline' : 'destructive'}
                className="text-sm px-3 py-1"
              >
                {healthPercentage}% Salud
              </Badge>
              {!productionLine.flowConfiguration && (
                <Badge variant="secondary" className="text-xs">
                  Sin configurar
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <span className="font-mono text-sm">{productionLine.code}</span>
              <span>•</span>
              <span className="text-sm">{productionLine.site?.name}</span>
              {totalAssets > 0 && (
                <>
                  <span>•</span>
                  <span className="text-sm">{totalAssets} activo{totalAssets !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/production-lines/${id}/edit`}>
            <Settings className="mr-2 h-4 w-4" />
            Editar Línea
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <ProductionLineStats productionLine={productionLine} />

      {/* Tabs Content */}
      <Tabs defaultValue="visualization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="visualization" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visualización
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <ListOrdered className="h-4 w-4" />
            Activos
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Métricas
          </TabsTrigger>
        </TabsList>

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagrama de la Línea de Producción</CardTitle>
              <CardDescription>
                Vista interactiva del flujo de producción con estados en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {productionLine.flowConfiguration ? (
                <div className="h-[600px] w-full">
                  <ProductionLineViewer
                    flowConfiguration={productionLine.flowConfiguration}
                    isEditable={false}
                    unitPrice={productionLine.unitPrice || undefined}
                    targetThroughput={productionLine.targetThroughput || undefined}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Settings className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Sin configuración visual
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Esta línea aún no tiene una configuración visual. Configura el diagrama para ver el flujo de producción de forma interactiva.
                  </p>
                  <Button asChild size="lg">
                    <Link href={`/production-lines/${id}/edit`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar Visualización
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          {productionLine.assets && productionLine.assets.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Activos en la Línea</CardTitle>
                <CardDescription>
                  Lista completa de activos configurados en orden de secuencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductionLineAssetsTable assets={productionLine.assets} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <ListOrdered className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Sin activos configurados
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Agrega activos a esta línea para comenzar a visualizar tu proceso de producción.
                </p>
                <Button asChild size="lg">
                  <Link href={`/production-lines/${id}/edit`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Agregar Activos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {productionLine.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {productionLine.description}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {productionLine.targetThroughput ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Throughput Objetivo
                  </CardTitle>
                  <CardDescription>
                    Meta de producción por hora
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">
                    {productionLine.targetThroughput}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unidades por hora
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Throughput Objetivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">No configurado</p>
                </CardContent>
              </Card>
            )}

            {productionLine.taktTime ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Takt Time
                  </CardTitle>
                  <CardDescription>
                    Tiempo entre unidades producidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">
                    {productionLine.taktTime}s
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Segundos por unidad
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Takt Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">No configurado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
