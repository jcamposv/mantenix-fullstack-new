"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { FilterButton } from "@/components/common/filter-button"
import { SACompaniesFilters } from "@/components/super-admin/sa-companies-filters"
import Image from "next/image"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  useSACompanies,
  type SACompanyFilters,
  type SACompanyItem,
} from '@/hooks/use-sa-companies'

export default function CompaniesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<SACompanyFilters>({})
  const limit = 20

  const { companies, loading, total, totalPages, refetch } = useSACompanies({
    page,
    limit,
    search,
    filters,
    autoRefresh: false,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<SACompanyItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (companyId: string) => {
    router.push(`/super-admin/companies/${companyId}/edit`)
  }

  const handleDelete = (company: SACompanyItem) => {
    setCompanyToDelete(company)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!companyToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/super-admin/companies/${companyToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Empresa desactivada exitosamente')
        setDeleteDialogOpen(false)
        setCompanyToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar la empresa')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error('Error al desactivar la empresa')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddCompany = () => {
    router.push("/super-admin/companies/new")
  }

  const columns: ColumnDef<SACompanyItem>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Nombre de Empresa",
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="flex items-center space-x-2">
            {company.logo && (
              <Image 
                src={company.logo} 
                alt={company.name} 
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <div>
              <div className="font-medium">{company.name}</div>
              <div className="text-sm text-muted-foreground">{company.subdomain}.mantenix.com</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "tier",
      header: "Plan",
      cell: ({ row }) => {
        const company = row.original
        const planName = company.subscription?.plan?.name || company.tier
        const planTier = company.subscription?.plan?.tier || company.tier

        return (
          <Badge variant={planTier === "ENTERPRISE" ? "default" : planTier === "PROFESSIONAL" || planTier === "BUSINESS" ? "secondary" : "outline"}>
            {planName}
          </Badge>
        )
      },
    },
    {
      accessorKey: "_count.users",
      header: "Usuarios",
      cell: ({ row }) => {
        return <div className="text-center">{row.original._count.users}</div>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Creado",
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const company = row.original

        return (
          <TableActions actions={[
            createEditAction(() => handleEdit(company.id)),
            createDeleteAction(() => handleDelete(company))
          ]} />
        )
      },
    },
  ], [])

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.hasSubscription) count++
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
        data={companies}
        searchKey="name"
        searchPlaceholder="Buscar empresas..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Empresas"
        description={`${total} empresas | Gestionar todas las empresas del sistema`}
        onAdd={handleAddCompany}
        addLabel="Agregar Empresa"
        loading={loading}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Empresas"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[300px]"
          >
            <SACompaniesFilters filters={filters} onFiltersChange={setFilters} />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Desactivar Empresa"
        description={`¿Está seguro que desea desactivar "${companyToDelete?.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}