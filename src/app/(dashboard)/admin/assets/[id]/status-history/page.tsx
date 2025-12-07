"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ArrowLeft, Calendar, Clock, User, FileText, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import { AssetStatusBadge, getAssetStatusIcon } from "@/components/common/asset-status-badge"
import { FilterButton } from "@/components/common/filter-button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { ASSET_STATUS_OPTIONS } from "@/schemas/asset-status"
import { useAsset } from "@/hooks/useAsset"
import { useAssetStatusHistory, type AssetStatusHistoryItem } from "@/hooks/useAssetStatusHistory"

type StatusHistoryRecord = AssetStatusHistoryItem

export default function AssetStatusHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string

  // Use the new useAsset hook with SWR
  const { asset, error: assetError } = useAsset(assetId)

  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const limit = 20

  // Use SWR hook for status history with filters
  const { history, total, loading } = useAssetStatusHistory(assetId, {
    limit,
    page,
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  })

  // Handle asset fetch error
  useEffect(() => {
    if (assetError) {
      toast.error("Error al cargar el activo")
    }
  }, [assetError])

  const calculateDuration = (startedAt: string, endedAt: string | null): string => {
    const start = new Date(startedAt)
    const end = endedAt ? new Date(endedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
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

  const clearFilters = () => {
    setDateRange(undefined)
    setStatusFilter(undefined)
    setPage(1)
  }

  const hasActiveFilters = Boolean(dateRange || statusFilter)
  const activeFiltersCount = (dateRange ? 1 : 0) + (statusFilter ? 1 : 0)

  const columns: ColumnDef<StatusHistoryRecord>[] = [
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const isActive = !row.original.endedAt
        const StatusIcon = getAssetStatusIcon(status)

        return (
          <div className="flex items-center gap-2">
            {StatusIcon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <StatusIcon className="h-4 w-4" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <AssetStatusBadge status={status} showIcon={false} />
              {isActive && (
                <Badge variant="outline" className="text-xs w-fit">
                  Actual
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "startedAt",
      header: "Fecha y Hora",
      cell: ({ row }) => {
        const startedAt = row.getValue("startedAt") as string
        return (
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">{formatDateTime(startedAt)}</span>
              {row.original.endedAt && (
                <span className="text-xs text-muted-foreground">
                  Hasta: {formatDateTime(row.original.endedAt)}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: "duration",
      header: "Duración",
      cell: ({ row }) => {
        const duration = calculateDuration(row.original.startedAt, row.original.endedAt)
        const isActive = !row.original.endedAt

        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {duration}
              {isActive && <span className="text-muted-foreground ml-1">(en curso)</span>}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "reason",
      header: "Razón",
      cell: ({ row }) => {
        const reason = row.getValue("reason") as string | null
        const notes = row.original.notes

        return (
          <div className="max-w-[300px]">
            {reason && (
              <div className="flex items-start gap-2 mb-1">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm">{reason}</span>
              </div>
            )}
            {notes && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md mt-1">
                {notes}
              </div>
            )}
            {!reason && !notes && (
              <span className="text-muted-foreground text-sm">Sin información</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "user",
      header: "Usuario",
      cell: ({ row }) => {
        const user = row.getValue("user") as StatusHistoryRecord["user"]

        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "workOrder",
      header: "Orden de Trabajo",
      cell: ({ row }) => {
        const workOrder = row.getValue("workOrder") as StatusHistoryRecord["workOrder"]

        if (!workOrder) {
          return <span className="text-muted-foreground text-sm">—</span>
        }

        return (
          <div className="flex items-start gap-2">
            <LinkIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium text-sm">{workOrder.number}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {workOrder.title}
              </span>
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/assets")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Historial de Estados
          </h1>
          {asset && (
            <p className="text-muted-foreground mt-1">
              {asset.name} <span className="text-sm">({asset.code})</span>
            </p>
          )}
        </div>
      </div>

      {/* Filters and Stats Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!loading && (
            <div className="text-sm">
              <span className="text-muted-foreground">Total de cambios:</span>{" "}
              <span className="font-semibold">{total}</span>
              {hasActiveFilters && (
                <span className="text-muted-foreground ml-2">
                  (mostrando {history.length})
                </span>
              )}
            </div>
          )}
        </div>

        <FilterButton
          title="Filtros de Historial"
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
          onReset={clearFilters}
        >
          <div className="space-y-4">
            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Rango de Fechas
              </Label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Seleccionar rango de fechas"
                className="w-full"
              />
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-3">
              <Label htmlFor="status-filter" className="text-sm font-medium">
                Estado del Activo
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" onClick={() => setStatusFilter(undefined)}>
                    Todos los estados
                  </SelectItem>
                  {ASSET_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterButton>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={history}
        loading={loading}
        hideHeader
      />
    </div>
  )
}
