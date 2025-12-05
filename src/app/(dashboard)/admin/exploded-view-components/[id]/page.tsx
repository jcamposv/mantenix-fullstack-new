/**
 * Component Detail Page
 *
 * Displays detailed information about an exploded view component.
 * Shows where it's used and technical details.
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2, Package, FileText, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import type { ExplodedViewComponentWithRelations } from "@/types/exploded-view.types"
import Link from "next/link"

export default function ComponentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [component, setComponent] = useState<ExplodedViewComponentWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComponentData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchComponentData = async () => {
    try {
      const response = await fetch(`/api/exploded-view-components/${id}`)
      if (!response.ok) throw new Error('Error al cargar el componente')

      const data = await response.json()
      setComponent(data)
    } catch (error) {
      console.error('Error fetching component:', error)
      toast.error('Error al cargar el componente')
      router.push('/admin/exploded-view-components')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!component) return null

  const hasDocuments = !!(component.manualUrl || component.installationUrl || component.imageUrl)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{component.name}</h2>
              <Badge variant={component.isActive ? "default" : "secondary"}>
                {component.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            {component.partNumber && (
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Package className="h-4 w-4" />
                P/N: {component.partNumber}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/exploded-view-components/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{component._count?.hotspots || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {component._count?.hotspots === 1 ? 'vista explosionada' : 'vistas explosionadas'}
            </p>
          </CardContent>
        </Card>

        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {component.inventoryItem ? '✓' : '−'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {component.inventoryItem ? 'Vinculado' : 'Sin vincular'}
            </p>
          </CardContent>
        </Card>

        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[component.manualUrl, component.installationUrl, component.imageUrl].filter(Boolean).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Documentos adjuntos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card className="w-full shadow-none">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {component.description && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Descripción</div>
                <div className="mt-1">{component.description}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {component.manufacturer && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Fabricante</div>
                  <div className="mt-1">{component.manufacturer}</div>
                </div>
              )}
              {component.partNumber && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Número de Parte</div>
                  <div className="mt-1 font-mono">{component.partNumber}</div>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Estado</div>
              <div className="mt-1">
                <Badge variant={component.isActive ? "default" : "secondary"}>
                  {component.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Linkage */}
        <Card className="w-full shadow-none">
          <CardHeader>
            <CardTitle>Vinculación con Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            {component.inventoryItem ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{component.inventoryItem.name}</div>
                    <div className="text-sm text-muted-foreground font-mono mt-0.5">
                      {component.inventoryItem.code}
                    </div>
                    {component.inventoryItem.description && (
                      <div className="text-sm mt-2">{component.inventoryItem.description}</div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <Link href={`/admin/inventory/items/${component.inventoryItemId}`}>
                    Ver Ítem de Inventario
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No está vinculado a ningún ítem de inventario</p>
                <p className="text-sm mt-1">Edita el componente para vincularlo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        {hasDocuments && (
          <Card className="w-full shadow-none">
            <CardHeader>
              <CardTitle>Documentación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {component.manualUrl && (
                <a
                  href={component.manualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Manual de Usuario</div>
                    <div className="text-xs text-muted-foreground">Ver documento</div>
                  </div>
                </a>
              )}
              {component.installationUrl && (
                <a
                  href={component.installationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Guía de Instalación</div>
                    <div className="text-xs text-muted-foreground">Ver documento</div>
                  </div>
                </a>
              )}
              {component.imageUrl && (
                <a
                  href={component.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Imagen del Componente</div>
                    <div className="text-xs text-muted-foreground">Ver imagen</div>
                  </div>
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Usage in Views */}
        <Card className={hasDocuments ? "md:col-span-1" : "md:col-span-2"}>
          <CardHeader>
            <CardTitle>Uso en Vistas Explosionadas</CardTitle>
            <CardDescription>
              Este componente aparece en {component._count?.hotspots || 0} {component._count?.hotspots === 1 ? 'vista' : 'vistas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {component.hotspots && component.hotspots.length > 0 ? (
              <div className="space-y-3">
                {component.hotspots.map((hotspot) => (
                  <Link
                    key={hotspot.id}
                    href={`/admin/exploded-views/${hotspot.viewId}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <div className="font-medium">
                        {hotspot.view?.name || 'Vista sin nombre'}
                      </div>
                      {hotspot.customLabel && (
                        <div className="text-sm text-muted-foreground mt-0.5">
                          Etiqueta: {hotspot.customLabel}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">
                      Ver
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Este componente no está siendo usado en ninguna vista</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
