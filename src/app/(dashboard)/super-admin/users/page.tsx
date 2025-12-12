"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { FilterButton } from "@/components/common/filter-button"
import { SAUsersFilters } from "@/components/super-admin/sa-users-filters"
import { Building2, Users } from "lucide-react"
import { UserAvatar } from "@/components/common/user-avatar"
import { RoleBadge } from "@/components/common/role-badge"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  useSAUsers,
  type SAUserFilters,
  type SAUserItem,
} from '@/hooks/use-sa-users'

export default function SuperAdminUsersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<SAUserFilters>({})
  const limit = 20

  const { users, loading, total, totalPages, refetch } = useSAUsers({
    page,
    limit,
    search,
    filters,
    autoRefresh: false,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<SAUserItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (userId: string) => {
    router.push(`/super-admin/users/${userId}/edit`)
  }

  const handleDelete = (user: SAUserItem) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/super-admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Usuario desactivado exitosamente')
        setDeleteDialogOpen(false)
        setUserToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar el usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al desactivar el usuario')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddUser = () => {
    router.push("/super-admin/users/new")
  }

  const columns: ColumnDef<SAUserItem>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Usuario",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center space-x-3">
            <UserAvatar name={user.name} image={user.image} />
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="space-y-1">
            <RoleBadge role={user.role.key || ''} />
            {user.isExternalUser && (
              <Badge variant="outline" className="text-xs">
                <Users className="mr-1 h-3 w-3" />
                Externo
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "company.name",
      header: "Empresa",
      cell: ({ row }) => {
        const user = row.original
        const company = user.company
        const clientCompany = user.clientCompany
        
        if (!company) {
          return <span className="text-muted-foreground">Sin empresa</span>
        }
        
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <div>
                <div className="font-medium">{company.name}</div>
                <div className="text-xs text-muted-foreground">{company.subdomain}</div>
              </div>
            </div>
            {user.isExternalUser && clientCompany && (
              <div className="flex items-center space-x-1 text-xs text-orange-600">
                <Users className="h-3 w-3" />
                <span>Cliente: {clientCompany.name}</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Estado",
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as boolean
        return (
          <Badge variant={verified ? "default" : "secondary"}>
            {verified ? "Verificado" : "Pendiente"}
          </Badge>
        )
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
        const user = row.original

        return (
          <TableActions actions={[
            createEditAction(() => handleEdit(user.id)),
            createDeleteAction(() => handleDelete(user))
          ]} />
        )
      },
    },
  ], [])

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.emailVerified) count++
    if (filters.isExternalUser) count++
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
        data={users}
        searchKey="name"
        searchPlaceholder="Buscar usuarios..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Gestión de Usuarios (Super Admin)"
        description={`${total} usuarios | Gestionar todos los usuarios de todas las empresas e inquilinos`}
        onAdd={handleAddUser}
        addLabel="Invitar Usuario"
        loading={loading}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Usuarios"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[300px]"
          >
            <SAUsersFilters filters={filters} onFiltersChange={setFilters} />
          </FilterButton>
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Desactivar Usuario"
        description={`¿Está seguro que desea desactivar al usuario "${userToDelete?.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}