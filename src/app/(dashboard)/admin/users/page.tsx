"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { FilterButton } from "@/components/common/filter-button"
import { UsersFilters } from "@/components/users/users-filters"
import { toast } from "sonner"
import { UserAvatar } from "@/components/common/user-avatar"
import { RoleBadge } from "@/components/common/role-badge"
import { TableActions, createEditAction, createDeleteAction, createResetPasswordAction } from "@/components/common/table-actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import {
  useUsersManagement,
  type UserManagementFilters,
  type UserItem,
} from '@/hooks/use-users-management'

export default function UsersPage() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<UserManagementFilters>({})
  const limit = 20

  const { users, loading, total, totalPages, refetch } = useUsersManagement({
    page,
    limit,
    search,
    filters,
    autoRefresh: false,
  })

  // Check permissions
  const canCreate = hasPermission('users.create')
  const canEdit = hasPermission('users.update')
  const canDelete = hasPermission('users.delete')

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: UserItem | null }>({
    open: false,
    user: null
  })
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; user: UserItem | null }>({
    open: false,
    user: null
  })

  const handleAddUser = () => {
    router.push("/admin/users/new")
  }

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  const handleDelete = (user: UserItem) => {
    setDeleteDialog({ open: true, user })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.user) return

    try {
      const response = await fetch(`/api/admin/users/${deleteDialog.user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Usuario desactivado exitosamente')
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar el usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al desactivar el usuario')
    }
  }

  const handleResetPassword = (user: UserItem) => {
    setResetPasswordDialog({ open: true, user })
  }

  const confirmResetPassword = async () => {
    if (!resetPasswordDialog.user) return

    try {
      const response = await fetch(`/api/admin/reset-password/${resetPasswordDialog.user.id}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Link de reseteo de contraseña enviado exitosamente al correo del usuario')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar link de reseteo')
      }
    } catch (error) {
      console.error('Error sending password reset:', error)
      toast.error('Error al enviar link de reseteo')
    }
  }

  const columns: ColumnDef<UserItem>[] = useMemo(() => [
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
        const role = row.original.role
        return <RoleBadge role={role.key || ''} />
      },
    },
  {
    accessorKey: "company.name",
    header: "Empresa",
    cell: ({ row }) => {
      const company = row.original.company
      if (!company) {
        return <span className="text-muted-foreground">Sin empresa</span>
      }
      return (
        <div>
          <div className="font-medium">{company.name}</div>
          <div className="text-sm text-muted-foreground">{company.subdomain}</div>
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
        const actions = [
          ...(canEdit ? [createEditAction(() => handleEdit(user.id))] : []),
          ...(canEdit ? [createResetPasswordAction(() => handleResetPassword(user))] : []),
          ...(canDelete ? [createDeleteAction(() => handleDelete(user))] : [])
        ]

        return <TableActions actions={actions} />
      },
    },
  ], [canEdit, canDelete])

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.emailVerified) count++
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
        title="Usuarios"
        description={`${total} usuarios | Filtre por verificación y más`}
        {...(canCreate && { onAdd: handleAddUser, addLabel: "Agregar Usuario" })}
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
            <UsersFilters filters={filters} onFiltersChange={setFilters} />
          </FilterButton>
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
        title="Desactivar Usuario"
        description={`¿Está seguro que desea desactivar al usuario "${deleteDialog.user?.name}"? Esta acción puede revertirse posteriormente.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      {/* Reset Password Confirmation Dialog */}
      <ConfirmDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => setResetPasswordDialog({ open, user: null })}
        title="Resetear Contraseña"
        description={`Se enviará un link de reseteo de contraseña a "${resetPasswordDialog.user?.name}" (${resetPasswordDialog.user?.email}). El usuario recibirá un correo con instrucciones para crear una nueva contraseña.`}
        confirmText="Enviar Link"
        cancelText="Cancelar"
        onConfirm={confirmResetPassword}
      />
    </div>
  )
}