"use client"

import { useState, useMemo, useCallback } from "react"
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
import { AssetStatusBadge } from "@/components/common/asset-status-badge"
import { OfflineStatusBanner } from "@/components/mobile/offline-status-banner"
import { useOfflineAssets } from "@/hooks/use-offline-data"

// Asset type with relations
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
  _count?: {
    workOrders: number
  }
}

const statusColors = {
  OPERATIVO: "bg-green-500",
  EN_MANTENIMIENTO: "bg-yellow-500",
  FUERA_DE_SERVICIO: "bg-red-500"
}

export default function MobileAssetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Offline-enabled data fetching
  const {
    data: assets,
    isLoading,
    isOffline,
    isStale,
    lastSyncAt,
    refresh
  } = useOfflineAssets({
    statusFilter: statusFilter || undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Memoized filtered assets
  const filteredAssets = useMemo(() => {
    if (!assets) return []
    return assets.filter((asset: Asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [assets, searchTerm])

  // Stats calculation
  const stats = useMemo(() => {
    const allAssets = assets || []
    return {
      operativo: allAssets.filter((a: Asset) => a.status === 'OPERATIVO').length,
      mantenimiento: allAssets.filter((a: Asset) => a.status === 'EN_MANTENIMIENTO').length,
      fueraServicio: allAssets.filter((a: Asset) => a.status === 'FUERA_DE_SERVICIO').length,
    }
  }, [assets])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }, [refresh])

  const handleClearFilters = useCallback(() => {
    setStatusFilter("")
    setSearchTerm("")
  }, [])

  // Loading state
  if (isLoading && !assets?.length) {
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
      {/* Offline/Stale status banner */}
      <OfflineStatusBanner
        isOffline={isOffline}
        isStale={isStale}
        onRefresh={handleRefresh}
        lastSyncAt={lastSyncAt}
        isRefreshing={refreshing}
        className="-mx-4 -mt-4 mb-4"
      />

      {/* Header with title */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="w-6 h-6" />
          Maquinas y Activos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona el estado de las maquinas
        </p>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar maquinas..."
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

        {/* Collapsible filters */}
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
              onClick={handleClearFilters}
              disabled={isOffline}
            >
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.operativo}
            </div>
            <div className="text-xs text-muted-foreground">Operativas</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.mantenimiento}
            </div>
            <div className="text-xs text-muted-foreground">Mantenimiento</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.fueraServicio}
            </div>
            <div className="text-xs text-muted-foreground">Fuera Servicio</div>
          </div>
        </Card>
      </div>

      {/* Asset list */}
      <div className="space-y-3">
        {filteredAssets.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">No hay maquinas</h3>
            <p className="text-muted-foreground text-sm">
              {searchTerm || statusFilter
                ? "No se encontraron maquinas con los filtros aplicados"
                : "No hay maquinas registradas en este momento"
              }
            </p>
          </Card>
        ) : (
          filteredAssets.map((asset: Asset) => (
            <Card
              key={asset.id}
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              onClick={() => router.push(`/mobile/assets/${asset.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status indicator */}
                  <div className={`w-1 h-full rounded-full ${statusColors[asset.status]} min-h-20`}></div>

                  <div className="flex-1 min-w-0">
                    {/* Header with name and status */}
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

                    {/* Category if exists */}
                    {asset.category && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {asset.category}
                      </div>
                    )}

                    {/* Location and site */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{asset.location}</span>
                      </div>
                      {asset.site && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{asset.site.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Related work orders */}
                    {asset._count?.workOrders && asset._count.workOrders > 0 && (
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
