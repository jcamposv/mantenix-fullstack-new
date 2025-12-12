/**
 * Exploded Views Admin Page
 *
 * Main page for managing exploded views.
 * Follows project patterns from assets page.
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ExplodedViewsTable } from "@/components/exploded-views/exploded-views-table"
import { usePermissions } from "@/hooks/usePermissions"

export default function ExplodedViewsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assetId = searchParams.get('assetId')
  const { hasPermission } = usePermissions()

  // Check permissions
  const canCreate = hasPermission('assets.create')

  return (
    <div className="space-y-6">
      {assetId && (
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Activo
        </Button>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {assetId ? 'Vistas Explosionadas del Activo' : 'Vistas Explosionadas'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {assetId
              ? 'Gestiona las vistas explosionadas de este activo'
              : 'Gestiona las vistas explosionadas de tus activos con hotspots interactivos'
            }
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/exploded-view-components">
                <Package className="mr-2 h-4 w-4" />
                Gestionar Componentes
              </Link>
            </Button>
            <Button asChild>
              <Link href={assetId ? `/admin/exploded-views/new?assetId=${assetId}` : "/admin/exploded-views/new"}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Vista
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vistas Explosionadas</CardTitle>
          <CardDescription>
            {assetId
              ? 'Listado de vistas explosionadas para este activo'
              : 'Listado de todas las vistas explosionadas configuradas en el sistema'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExplodedViewsTable assetId={assetId || undefined} />
        </CardContent>
      </Card>
    </div>
  )
}
