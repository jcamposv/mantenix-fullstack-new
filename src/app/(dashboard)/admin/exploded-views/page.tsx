/**
 * Exploded Views Admin Page
 *
 * Main page for managing exploded views.
 * Follows project patterns from assets page.
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ExplodedViewsTable } from "@/components/exploded-views/exploded-views-table"
import { usePermissions } from "@/hooks/usePermissions"

export default function ExplodedViewsPage() {
  const { hasPermission } = usePermissions()

  // Check permissions
  const canCreate = hasPermission('assets.create')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vistas Explosionadas</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las vistas explosionadas de tus activos con hotspots interactivos
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/exploded-views/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Vista
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vistas Explosionadas</CardTitle>
          <CardDescription>
            Listado de todas las vistas explosionadas configuradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExplodedViewsTable />
        </CardContent>
      </Card>
    </div>
  )
}
