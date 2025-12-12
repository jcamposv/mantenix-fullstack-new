"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Package, MapPin, Loader2 } from "lucide-react"
import { StockBadge } from "@/components/inventory/stock-badge"
import { toast } from "sonner"
import { useInventoryItem } from "@/hooks/useInventoryItem"

export default function InventoryItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // Use the new useInventoryItem hook with SWR
  const { item, loading, error } = useInventoryItem(id)

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar el ítem')
      router.push('/admin/inventory/items')
    }
  }, [error, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!item) return null

  const totalValue = (item.unitCost || 0) * item.totalQuantity

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
              <h2 className="text-2xl font-bold tracking-tight">{item.name}</h2>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Package className="h-4 w-4" />
              {item.code}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/inventory/items/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.totalQuantity}</div>
            <p className="text-xs text-muted-foreground mt-1">{item.unit}</p>
          </CardContent>
        </Card>

        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{item.totalAvailable}</div>
            <p className="text-xs text-muted-foreground mt-1">{item.unit}</p>
          </CardContent>
        </Card>

        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reservado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{item.totalReserved}</div>
            <p className="text-xs text-muted-foreground mt-1">{item.unit}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.unitCost ? `$${item.unitCost.toLocaleString('es-ES')} / ${item.unit}` : '-'}
            </p>
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
            {item.description && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Descripción</div>
                <div className="mt-1">{item.description}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Categoría</div>
                <div className="mt-1">{item.category || '-'}</div>
              </div>
              {item.subcategory && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Subcategoría</div>
                  <div className="mt-1">{item.subcategory}</div>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Empresa</div>
              <div className="mt-1">{item.company.name}</div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="w-full shadow-none">
          <CardHeader>
            <CardTitle>Detalles Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {item.manufacturer && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Fabricante</div>
                  <div className="mt-1">{item.manufacturer}</div>
                </div>
              )}
              {item.model && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Modelo</div>
                  <div className="mt-1">{item.model}</div>
                </div>
              )}
              {item.partNumber && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Número de Parte</div>
                  <div className="mt-1">{item.partNumber}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Niveles de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado Actual</span>
                <StockBadge
                  currentStock={item.totalQuantity}
                  minStock={item.minStock}
                  reorderPoint={item.reorderPoint}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stock Mínimo</span>
                  <span className="font-medium">{item.minStock} {item.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Punto de Reorden</span>
                  <span className="font-medium">{item.reorderPoint} {item.unit}</span>
                </div>
                {item.maxStock && (
                  <div className="flex justify-between text-sm">
                    <span>Stock Máximo</span>
                    <span className="font-medium">{item.maxStock} {item.unit}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Stock por Ubicación</CardTitle>
            <CardDescription>{item.stock.length} ubicaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {item.stock.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay stock en ninguna ubicación</p>
              ) : (
                item.stock.map((stockItem) => (
                  <div key={stockItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{stockItem.locationName}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {stockItem.locationType.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{stockItem.quantity} {item.unit}</div>
                      <div className="text-xs text-muted-foreground">
                        Disp: {stockItem.availableQuantity}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
