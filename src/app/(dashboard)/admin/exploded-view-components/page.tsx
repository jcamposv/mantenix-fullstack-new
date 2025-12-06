/**
 * Exploded View Components Admin Page
 *
 * Main page for managing component library.
 * Follows project patterns.
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ComponentsTable } from "@/components/exploded-views/components-table"
import { usePermissions } from "@/hooks/usePermissions"

export default function ExplodedViewComponentsPage() {
  const { hasPermission, loading } = usePermissions()

  // Check permissions - components are created by anyone with asset or inventory permissions
  const canCreate = hasPermission('assets.create') || hasPermission('inventory.create_item')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Componentes</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los componentes reutilizables para vistas explosionadas
          </p>
        </div>
        {!loading && canCreate && (
          <Button asChild>
            <Link href="/admin/exploded-view-components/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Componente
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Componentes</CardTitle>
          <CardDescription>
            Biblioteca de componentes y partes que pueden ser utilizados en múltiples vistas explosionadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComponentsTable />
        </CardContent>
      </Card>
    </div>
  )
}
