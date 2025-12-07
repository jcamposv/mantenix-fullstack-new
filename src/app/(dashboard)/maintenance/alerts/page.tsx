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

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { FilterButton } from '@/components/common/filter-button'
import { MaintenanceAlertsFilters } from '@/components/maintenance/maintenance-alerts-filters'
import { MaintenanceAlertsSummary } from '@/components/maintenance/maintenance-alerts-summary'
import { getMaintenanceAlertsColumns } from '@/components/maintenance/maintenance-alerts-columns'
import {
  useMaintenanceAlertsManagement,
  type AlertManagementFilters,
} from '@/hooks/use-maintenance-alerts-management'
import type { MaintenanceAlert } from '@/types/maintenance-alert.types'

export default function MaintenanceAlertsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AlertManagementFilters>({})
  const limit = 20

  const { alerts, loading, total, totalPages, summary } =
    useMaintenanceAlertsManagement({
      page,
      limit,
      filters,
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
    })

  const handleViewComponent = (componentId: string) => {
    router.push(`/admin/exploded-view-components/${componentId}`)
  }

  const handleCreateWorkOrder = (alert: MaintenanceAlert) => {
    router.push(`/work-orders/new/select-template?componentId=${alert.componentId}`)
  }

  const columns = useMemo(
    () => getMaintenanceAlertsColumns(handleViewComponent, handleCreateWorkOrder),
    []
  )

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.severity && filters.severity.length > 0) count++
    if (filters.criticality && filters.criticality.length > 0) count++
    if (filters.stockStatus && filters.stockStatus.length > 0) count++
    if (filters.daysUntilMaintenance) count++
    return count
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  return (
    <div className="container mx-auto py-0 space-y-6">
      <MaintenanceAlertsSummary summary={summary} />

      <DataTable
        columns={columns}
        data={alerts}
        searchKey="componentName"
        searchPlaceholder="Buscar componente..."
        title="Alertas de Mantenimiento Predictivo"
        description={`${total} alertas basadas en MTBF y niveles de inventario`}
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
            contentClassName="w-[400px]"
          >
            <MaintenanceAlertsFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />
    </div>
  )
}
