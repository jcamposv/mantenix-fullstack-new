import { AuthService } from '@/server/services/auth.service'
import { ProductionLineService } from '@/server/services/production-line.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductionLinesTable } from '@/components/production-lines/production-lines-table'
import Link from 'next/link'
import {
  Plus,
  Factory,
  Activity,
  TrendingUp,
  Settings2,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

/**
 * Production Lines List Page
 * Shows all production lines with stats
 */
export default async function ProductionLinesPage() {
  const sessionResult = await AuthService.getAuthenticatedSession()
  
  // Type guard: redirect if not authenticated
  if (sessionResult instanceof NextResponse) {
    redirect('/login')
  }

  // Fetch production lines and stats in parallel
  const [{ productionLines }, stats] = await Promise.all([
    ProductionLineService.getProductionLines(sessionResult, {}, { page: 1, limit: 100 }),
    ProductionLineService.getStats(sessionResult),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Líneas de Producción</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona tus líneas de producción
          </p>
        </div>
        <Button asChild>
          <Link href="/production-lines/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Línea
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Líneas
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLines}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeLines} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Máquinas Totales
            </CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMachines}</div>
            <p className="text-xs text-muted-foreground">
              En todas las líneas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Utilización
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.operationalMachines} de {stats.totalMachines} operativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Throughput Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageThroughput?.toFixed(0) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Unidades/hora</p>
          </CardContent>
        </Card>
      </div>

      {/* Production Lines Table */}
      {productionLines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Factory className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No hay líneas de producción
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Crea tu primera línea de producción para comenzar a visualizar
              tu proceso productivo
            </p>
            <Button asChild>
              <Link href="/production-lines/new">
                <Plus className="mr-2 h-4 w-4" />
                Crear Línea
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Líneas de Producción</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductionLinesTable productionLines={productionLines} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
