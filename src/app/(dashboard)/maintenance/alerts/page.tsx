/**
 * Maintenance Alerts Management Page
 *
 * Comprehensive view of all MTBF-based maintenance alerts with filtering.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - SWR for data fetching
 * - Type-safe
 * - Clean component composition (under 200 lines)
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataTable } from '@/components/ui/data-table'
import { FilterButton } from '@/components/common/filter-button'
import { MaintenanceAlertsFilters } from '@/components/maintenance/maintenance-alerts-filters'
import { MaintenanceAlertsSummary } from '@/components/maintenance/maintenance-alerts-summary'
import { getMaintenanceAlertsColumns } from '@/components/maintenance/maintenance-alerts-columns'
import { DismissAlertDialog } from '@/components/maintenance/dismiss-alert-dialog'
import {
  useMaintenanceAlertsManagement,
  type AlertManagementFilters,
} from '@/hooks/use-maintenance-alerts-management'
import type { MaintenanceAlert } from '@/types/maintenance-alert.types'

export default function MaintenanceAlertsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AlertManagementFilters>({
    status: 'ACTIVE', // Default to active alerts
  })
  const [showDismissDialog, setShowDismissDialog] = useState(false)
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [isLoadingDismiss, setIsLoadingDismiss] = useState(false)
  const limit = 20

  const { alerts, loading, total, totalPages, summary, refetch } =
    useMaintenanceAlertsManagement({
      page,
      limit,
      filters,
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
    })

  const handleViewComponent = useCallback((componentId: string) => {
    router.push(`/admin/exploded-view-components/${componentId}`)
  }, [router])

  const handleCreateWorkOrder = useCallback((alert: MaintenanceAlert) => {
    router.push(`/work-orders/new/select-template?componentId=${alert.componentId}`)
  }, [router])

  const handleDismissAlert = useCallback((alertHistoryId: string) => {
    setSelectedAlertId(alertHistoryId)
    setShowDismissDialog(true)
  }, [])

  const handleDismissSubmit = async (data: { reason: string }) => {
    if (!selectedAlertId) return

    setIsLoadingDismiss(true)
    try {
      const response = await fetch(`/api/maintenance/alert-history/${selectedAlertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'dismiss',
          reason: data.reason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al dismissar la alerta')
      }

      toast.success('Alerta dismissada exitosamente')
      setShowDismissDialog(false)
      setSelectedAlertId(null)
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al dismissar la alerta')
    } finally {
      setIsLoadingDismiss(false)
    }
  }

  const columns = useMemo(
    () => getMaintenanceAlertsColumns(handleViewComponent, handleCreateWorkOrder, handleDismissAlert),
    [handleViewComponent, handleCreateWorkOrder, handleDismissAlert]
  )

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    // Status filter (no contar si es ACTIVE, que es el default)
    if (filters.status && filters.status !== 'ACTIVE') count++
    // Date range filters
    if (filters.startDate || filters.endDate) count++
    // Otros filtros
    if (filters.severity && filters.severity.length > 0) count++
    if (filters.criticality && filters.criticality.length > 0) count++
    if (filters.stockStatus && filters.stockStatus.length > 0) count++
    if (filters.daysUntilMaintenance) count++
    return count
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  const handleClearFilters = () => {
    setFilters({ status: 'ACTIVE' }) // Mantener ACTIVE como default
    setPage(1)
  }

  return (
    <>
      <div className="container mx-auto py-0 space-y-6">
        <MaintenanceAlertsSummary summary={summary} />

        <DataTable
          columns={columns}
          data={alerts}
          searchKey="componentName"
          searchPlaceholder="Buscar componente..."
          title="Alertas de Mantenimiento Predictivo"
          description={`${total} alertas | Filtre por estado y fechas para ver histórico`}
          loading={loading}
          manualPagination={true}
          pageCount={totalPages}
          pageIndex={page - 1}
          pageSize={limit}
          onPageChange={setPage}
          toolbar={
            <FilterButton
              title="Filtros de Alertas"
              hasActiveFilters={hasActiveFilters}
              activeFiltersCount={activeFiltersCount}
              onReset={handleClearFilters}
              contentClassName="w-[700px]"
            >
              <MaintenanceAlertsFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </FilterButton>
          }
        />
      </div>

      {/* Dismiss Alert Dialog */}
      <DismissAlertDialog
        open={showDismissDialog}
        onOpenChange={setShowDismissDialog}
        onSubmit={handleDismissSubmit}
        isLoading={isLoadingDismiss}
        alertMessage="¿Está seguro que desea dismissar esta alerta?"
      />
    </>
  )
}
