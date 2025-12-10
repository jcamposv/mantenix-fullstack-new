/**
 * Assets Management Page
 *
 * Comprehensive view of all assets with server-side pagination and filtering.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - SWR for data fetching
 * - Type-safe
 * - Clean component composition (under 450 lines)
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { FilterButton } from '@/components/common/filter-button'
import { AssetsFilters } from '@/components/assets/assets-filters'
import {
  Package,
  MapPin,
  Building2,
  Calendar,
  RefreshCw,
  History,
  List,
  Boxes,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  TableActions,
  createEditAction,
  createDeleteAction,
} from '@/components/common/table-actions'
import { SignedImage } from '@/components/signed-image'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { AssetStatusBadge } from '@/components/common/asset-status-badge'
import { ChangeAssetStatusDialog } from '@/components/common/change-asset-status-dialog'
import { AssetStatusHistoryDialog } from '@/components/common/asset-status-history-dialog'
import type { ChangeAssetStatusData } from '@/schemas/asset-status'
import { useSession } from '@/lib/auth-client'
import { usePermissions } from '@/hooks/usePermissions'
import {
  useAssetsManagement,
  type AssetManagementFilters,
  type AssetItem,
} from '@/hooks/use-assets-management'

export default function AssetsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { hasPermission } = usePermissions()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<AssetManagementFilters>(() => {
    // Initialize with siteId from URL if present
    const siteId = searchParams.get('siteId')
    return siteId ? { siteId } : {}
  })

  const limit = 20

  const { assets, loading, total, totalPages, refetch } = useAssetsManagement({
    page,
    limit,
    search,
    filters,
    autoRefresh: false,
  })

  // Check permissions
  const canCreate = hasPermission('assets.create')
  const canEdit = hasPermission('assets.edit')
  const canDelete = hasPermission('assets.delete')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<AssetItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Change status dialog state
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false)
  const [assetToChangeStatus, setAssetToChangeStatus] =
    useState<AssetItem | null>(null)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  // History dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [assetForHistory, setAssetForHistory] = useState<AssetItem | null>(null)

  // Check if user can change status
  const userRole = (session?.user as { role?: string })?.role
  const canChangeStatus = Boolean(
    userRole &&
      [
        'OPERARIO',
        'TECNICO',
        'SUPERVISOR',
        'JEFE_MANTENIMIENTO',
        'ADMIN_EMPRESA',
        'ADMIN_GRUPO',
        'SUPER_ADMIN',
      ].includes(userRole)
  )

  const handleAddAsset = () => {
    router.push('/admin/assets/new')
  }

  const handleEdit = useCallback(
    (assetId: string) => {
      router.push(`/admin/assets/${assetId}/edit`)
    },
    [router]
  )

  const handleDelete = (asset: AssetItem) => {
    setAssetToDelete(asset)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!assetToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/assets/${assetToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Activo desactivado exitosamente')
        setDeleteDialogOpen(false)
        setAssetToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar el activo')
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast.error('Error al desactivar el activo')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewHistory = (asset: AssetItem) => {
    setAssetForHistory(asset)
    setHistoryDialogOpen(true)
  }

  const handleViewFullHistory = (assetId: string) => {
    router.push(`/admin/assets/${assetId}/status-history`)
  }

  const handleChangeStatus = (asset: AssetItem) => {
    setAssetToChangeStatus(asset)
    setChangeStatusDialogOpen(true)
  }

  const confirmChangeStatus = async (data: ChangeAssetStatusData) => {
    if (!assetToChangeStatus) return

    try {
      setIsChangingStatus(true)
      const response = await fetch('/api/assets/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Estado del activo actualizado exitosamente')
        setChangeStatusDialogOpen(false)
        setAssetToChangeStatus(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cambiar el estado del activo')
      }
    } catch (error) {
      console.error('Error changing asset status:', error)
      toast.error('Error al cambiar el estado del activo')
    } finally {
      setIsChangingStatus(false)
    }
  }

  const columns: ColumnDef<AssetItem>[] = useMemo(
    () => [
      {
        accessorKey: 'images',
        header: '',
        cell: ({ row }) => {
          const asset = row.original
          const firstImage = asset.images?.[0]
          return (
            <div className="w-10 h-10">
              {firstImage ? (
                <SignedImage
                  src={firstImage}
                  alt={asset.name}
                  width={40}
                  height={40}
                  className="rounded-md object-cover w-10 h-10"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'name',
        header: 'Activo',
        cell: ({ row }) => {
          const asset = row.original
          return (
            <div className="space-y-1">
              <div className="font-medium">{asset.name}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Package className="mr-1 h-3 w-3" />
                {asset.code}
              </div>
              {asset.category && (
                <div className="text-xs text-muted-foreground">
                  {asset.category}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'site.name',
        header: 'Sede',
        cell: ({ row }) => {
          const asset = row.original
          return (
            <div className="space-y-1">
              <div className="flex items-center">
                <Building2 className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{asset.site.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {asset.site.clientCompany.name}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {asset.location}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return <AssetStatusBadge status={status} />
        },
      },
      {
        accessorKey: 'manufacturer',
        header: 'Información Técnica',
        cell: ({ row }) => {
          const asset = row.original
          return (
            <div className="space-y-1">
              {asset.manufacturer && (
                <div className="text-sm font-medium">{asset.manufacturer}</div>
              )}
              {asset.model && (
                <div className="text-sm text-muted-foreground">
                  {asset.model}
                </div>
              )}
              {asset.serialNumber && (
                <div className="text-xs text-muted-foreground">
                  Serie: {asset.serialNumber}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'registrationDate',
        header: 'Fecha de Registro',
        cell: ({ row }) => {
          const registrationDate = row.getValue('registrationDate') as string
          return (
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
              <span>{new Date(registrationDate).toLocaleDateString()}</span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const asset = row.original
          const actions = [
            {
              label: 'Vista Explosionada',
              icon: Boxes,
              onClick: () =>
                router.push(`/admin/exploded-views?assetId=${asset.id}`),
            },
            {
              label: 'Ver Historial Rápido',
              icon: History,
              onClick: () => handleViewHistory(asset),
            },
            {
              label: 'Historial Completo',
              icon: List,
              onClick: () => handleViewFullHistory(asset.id),
            },
            ...(canChangeStatus
              ? [
                  {
                    label: 'Cambiar Estado',
                    icon: RefreshCw,
                    onClick: () => handleChangeStatus(asset),
                  },
                ]
              : []),
            ...(canEdit ? [createEditAction(() => handleEdit(asset.id))] : []),
            ...(canDelete ? [createDeleteAction(() => handleDelete(asset))] : []),
          ]

          return <TableActions actions={actions} />
        },
      },
    ],
    [router, canChangeStatus, canEdit, canDelete, handleEdit]
  )

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.status) count++
    if (filters.category) count++
    if (filters.isActive) count++
    if (filters.siteId) count++ // Count siteId filter
    return count
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
    // Clear siteId from URL if present
    router.push('/admin/assets')
  }

  const getTitle = () => {
    if (filters.siteId && assets.length > 0) {
      return `Activos de ${assets[0]?.site?.name}`
    }
    return 'Activos'
  }

  const getDescription = () => {
    if (filters.siteId) {
      return 'Activos de la sede seleccionada'
    }
    return `${total} activos | Filtre por estado, categoría y más`
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="container mx-auto py-0">
      {filters.siteId && (
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/assets')}
            className="mb-4"
          >
            ← Ver Todos los Activos
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={assets}
        searchKey="name"
        searchPlaceholder="Buscar activos..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title={getTitle()}
        description={getDescription()}
        {...(canCreate && {
          onAdd: handleAddAsset,
          addLabel: 'Agregar Activo',
        })}
        loading={loading}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Activos"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[500px]"
          >
            <AssetsFilters filters={filters} onFiltersChange={setFilters} />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Desactivar Activo"
        description={`¿Está seguro que desea desactivar "${assetToDelete?.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />

      {assetToChangeStatus && (
        <ChangeAssetStatusDialog
          open={changeStatusDialogOpen}
          onOpenChange={setChangeStatusDialogOpen}
          onSubmit={confirmChangeStatus}
          assetId={assetToChangeStatus.id}
          assetName={assetToChangeStatus.name}
          currentStatus={assetToChangeStatus.status}
          isLoading={isChangingStatus}
        />
      )}

      {assetForHistory && (
        <AssetStatusHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          assetId={assetForHistory.id}
          assetName={assetForHistory.name}
        />
      )}
    </div>
  )
}
