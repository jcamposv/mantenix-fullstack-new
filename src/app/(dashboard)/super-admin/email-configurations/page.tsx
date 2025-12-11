"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { FilterButton } from "@/components/common/filter-button"
import { SAEmailConfigsFilters } from "@/components/super-admin/sa-email-configs-filters"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { toast } from "sonner"
import { Mail, FileText } from "lucide-react"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  useSAEmailConfigs,
  type SAEmailConfigFilters,
  type SAEmailConfigItem,
} from '@/hooks/use-sa-email-configs'

export default function EmailConfigurationsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<SAEmailConfigFilters>({})
  const limit = 20

  const { configurations, loading, total, totalPages, refetch } = useSAEmailConfigs({
    page,
    limit,
    search,
    filters,
    autoRefresh: false,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [configToDelete, setConfigToDelete] = useState<SAEmailConfigItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (configId: string) => {
    router.push(`/super-admin/email-configurations/${configId}/edit`)
  }

  const handleDelete = (config: SAEmailConfigItem) => {
    setConfigToDelete(config)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!configToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/email-configurations/${configToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Configuración desactivada exitosamente')
        setDeleteDialogOpen(false)
        setConfigToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar la configuración')
      }
    } catch (error) {
      console.error('Error deleting email configuration:', error)
      toast.error('Error al desactivar la configuración')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddConfiguration = () => {
    router.push("/super-admin/email-configurations/new")
  }

  const handleViewTemplates = (configId: string) => {
    router.push(`/super-admin/email-configurations/${configId}/templates`)
  }

  const columns: ColumnDef<SAEmailConfigItem>[] = useMemo(() => [
    {
      accessorKey: "company",
      header: "Empresa",
      cell: ({ row }) => {
        const company = row.original.company
        return (
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{company?.name || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">{company?.subdomain}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "fromEmail",
      header: "Email Remitente",
      cell: ({ row }) => {
        return (
          <div>
            <div className="font-medium">{row.original.fromName}</div>
            <div className="text-sm text-muted-foreground">{row.original.fromEmail}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "_count.emailTemplates",
      header: "Templates",
      cell: ({ row }) => {
        const count = row.original._count?.emailTemplates || 0
        return (
          <button
            onClick={() => handleViewTemplates(row.original.id)}
            className="text-sm text-blue-600 hover:underline"
          >
            {count} template{count !== 1 ? 's' : ''}
          </button>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const config = row.original
        return (
          <TableActions
            actions={[
              createEditAction(() => handleEdit(config.id)),
              {
                label: "Ver Templates",
                onClick: () => handleViewTemplates(config.id),
                icon: FileText
              },
              createDeleteAction(() => handleDelete(config))
            ]}
          />
        )
      },
    },
  ], [])

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.isActive) count++
    return count
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="container mx-auto py-0">
      <DataTable
        columns={columns}
        data={configurations}
        searchKey="fromEmail"
        searchPlaceholder="Buscar configuraciones..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Configuraciones de Email"
        description={`${total} configuraciones | Gestiona las configuraciones de MailerSend para cada empresa`}
        onAdd={handleAddConfiguration}
        addLabel="Nueva Configuración"
        loading={loading}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Configuraciones"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[300px]"
          >
            <SAEmailConfigsFilters filters={filters} onFiltersChange={setFilters} />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Desactivar Configuración de Email"
        description={`¿Está seguro que desea desactivar la configuración de email para "${configToDelete?.company?.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
