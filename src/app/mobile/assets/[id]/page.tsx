"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Package,
  MapPin,
  Building2,
  Wrench,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Plus
} from "lucide-react"
import { toast } from "sonner"
import { AssetStatusBadge } from "@/components/common/asset-status-badge"
import { ChangeAssetStatusDialog } from "@/components/common/change-asset-status-dialog"
import type { ChangeAssetStatusData } from "@/schemas/asset-status"

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
  serialNumber: string | null
  site: {
    id: string
    name: string
    clientCompany: {
      name: string
    }
  }
}

interface StatusHistoryRecord {
  id: string
  status: string
  startedAt: string
  endedAt: string | null
  reason: string | null
  user: {
    name: string
  }
}

const statusConfig = {
  OPERATIVO: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/20",
    label: "Operativo"
  },
  EN_MANTENIMIENTO: {
    icon: AlertCircle,
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    label: "En Mantenimiento"
  },
  FUERA_DE_SERVICIO: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
    label: "Fuera de Servicio"
  }
}

export default function MobileAssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [history, setHistory] = useState<StatusHistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  useEffect(() => {
    fetchAssetData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId])

  const fetchAssetData = async () => {
    try {
      setLoading(true)
      // Fetch asset details
      const assetResponse = await fetch(`/api/admin/assets/${assetId}`)
      if (assetResponse.ok) {
        const assetData = await assetResponse.json()
        setAsset(assetData.asset || assetData)
      } else {
        toast.error("Error al cargar el activo")
        router.push('/mobile/assets')
        return
      }

      // Fetch recent status history (last 5)
      const historyResponse = await fetch(`/api/assets/${assetId}/status-history?limit=5`)
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setHistory(historyData.history || [])
      }
    } catch (error) {
      console.error('Error fetching asset data:', error)
      toast.error('Error al cargar el activo')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async (data: ChangeAssetStatusData) => {
    if (!asset) return

    try {
      setIsChangingStatus(true)
      const response = await fetch('/api/assets/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Estado actualizado exitosamente')
        setChangeStatusDialogOpen(false)
        // Refresh asset data
        fetchAssetData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cambiar el estado')
      }
    } catch (error) {
      console.error('Error changing asset status:', error)
      toast.error('Error al cambiar el estado')
    } finally {
      setIsChangingStatus(false)
    }
  }

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading || !asset) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-1/3"></div>
        <Card>
          <CardContent className="p-6">
            <div className="h-24 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StatusIcon = statusConfig[asset.status].icon

  return (
    <div className="space-y-4 pb-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/mobile/assets')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{asset.name}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Package className="w-3 h-3" />
            {asset.code}
          </p>
        </div>
      </div>

      {/* Estado actual destacado */}
      <Card className={statusConfig[asset.status].bg}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center flex-col gap-3">
            <StatusIcon className={`w-16 h-16 ${statusConfig[asset.status].color}`} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Estado Actual</p>
              <AssetStatusBadge status={asset.status} className="text-base px-4 py-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción rápida */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          size="lg"
          className="h-14 text-base"
          onClick={() => setChangeStatusDialogOpen(true)}
        >
          <Wrench className="w-5 h-5 mr-2" />
          Cambiar Estado
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 text-base"
          onClick={() => router.push(`/mobile/create-work-order?assetId=${asset.id}`)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Reportar Problema (Crear OT)
        </Button>
      </div>

      {/* Información del activo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Información
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {asset.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Descripción</p>
              <p className="text-sm">{asset.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Ubicación</p>
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{asset.location}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Sede</p>
              <div className="flex items-center gap-1.5 text-sm">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{asset.site.name}</span>
              </div>
            </div>
          </div>

          {asset.category && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Categoría</p>
              <p className="text-sm">{asset.category}</p>
            </div>
          )}

          {(asset.manufacturer || asset.model) && (
            <div className="grid grid-cols-2 gap-3">
              {asset.manufacturer && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Fabricante</p>
                  <p className="text-sm">{asset.manufacturer}</p>
                </div>
              )}
              {asset.model && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Modelo</p>
                  <p className="text-sm">{asset.model}</p>
                </div>
              )}
            </div>
          )}

          {asset.serialNumber && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Número de Serie</p>
              <p className="text-sm font-mono">{asset.serialNumber}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial reciente */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Historial Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((record) => (
                <div key={record.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="shrink-0 pt-1">
                    <AssetStatusBadge status={record.status} showIcon={false} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{record.reason || "Cambio de estado"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {record.user.name} • {formatDateTime(record.startedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3"
              onClick={() => router.push(`/admin/assets/${asset.id}/status-history`)}
            >
              Ver Historial Completo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para cambiar estado */}
      <ChangeAssetStatusDialog
        open={changeStatusDialogOpen}
        onOpenChange={setChangeStatusDialogOpen}
        onSubmit={handleChangeStatus}
        assetId={asset.id}
        assetName={asset.name}
        currentStatus={asset.status}
        isLoading={isChangingStatus}
      />
    </div>
  )
}
