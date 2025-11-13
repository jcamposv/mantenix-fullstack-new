"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, MapPin, Building2, Search, Filter, Wrench } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AssetStatusBadge } from "@/components/common/asset-status-badge"
import { useCurrentUser } from "@/hooks/useCurrentUser"

interface Asset {
  id: string
  name: string
  code: string
  description: string | null
  location: string
  status: "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
  category: string | null
  manufacturer: string | null
  model: string | null
  site: {
    id: string
    name: string
    clientCompany: {
      name: string
    }
  }
  _count: {
    workOrders: number
  }
}

const statusColors = {
  OPERATIVO: "bg-green-500",
  EN_MANTENIMIENTO: "bg-yellow-500",
  FUERA_DE_SERVICIO: "bg-red-500"
}

export default function MobileAssetsPage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && currentUser) {
      fetchAssets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, currentUser, statusFilter])

  const fetchAssets = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/assets?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setAssets(data.assets || data.items || data)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cargar los activos')
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
      toast.error('Error al cargar los activos')
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="mb-4">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con título */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="w-6 h-6" />
          Máquinas y Activos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona el estado de las máquinas
        </p>
      </div>

      {/* Búsqueda y filtros */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar máquinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filtros colapsables */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-3 p-3 bg-muted/50 rounded-lg">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="OPERATIVO">Operativo</SelectItem>
                <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                <SelectItem value="FUERA_DE_SERVICIO">Fuera de Servicio</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter("")
                fetchAssets()
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {assets.filter(a => a.status === 'OPERATIVO').length}
            </div>
            <div className="text-xs text-muted-foreground">Operativas</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {assets.filter(a => a.status === 'EN_MANTENIMIENTO').length}
            </div>
            <div className="text-xs text-muted-foreground">Mantenimiento</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {assets.filter(a => a.status === 'FUERA_DE_SERVICIO').length}
            </div>
            <div className="text-xs text-muted-foreground">Fuera Servicio</div>
          </div>
        </Card>
      </div>

      {/* Lista de activos */}
      <div className="space-y-3">
        {filteredAssets.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">No hay máquinas</h3>
            <p className="text-muted-foreground text-sm">
              {searchTerm || statusFilter
                ? "No se encontraron máquinas con los filtros aplicados"
                : "No hay máquinas registradas en este momento"
              }
            </p>
          </Card>
        ) : (
          filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              onClick={() => router.push(`/mobile/assets/${asset.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Indicador de estado */}
                  <div className={`w-1 h-full rounded-full ${statusColors[asset.status]} min-h-20`}></div>

                  <div className="flex-1 min-w-0">
                    {/* Header con nombre y estado */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight">
                          {asset.name}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Package className="w-3 h-3" />
                          {asset.code}
                        </p>
                      </div>
                      <AssetStatusBadge status={asset.status} />
                    </div>

                    {/* Categoría si existe */}
                    {asset.category && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {asset.category}
                      </div>
                    )}

                    {/* Ubicación y sede */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{asset.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{asset.site.name}</span>
                      </div>
                    </div>

                    {/* Órdenes de trabajo relacionadas */}
                    {asset._count.workOrders > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <Badge variant="outline" className="text-xs">
                          {asset._count.workOrders} {asset._count.workOrders === 1 ? 'OT' : 'OTs'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
