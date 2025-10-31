"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Building2, Users } from "lucide-react"
import { UserAvatar } from "@/components/common/user-avatar"
import { RoleBadge } from "@/components/common/role-badge"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string
  image: string | null
  isExternalUser: boolean
  createdAt: string
  company: {
    id: string
    name: string
    subdomain: string
  } | null
  clientCompany: {
    id: string
    name: string
    contactName: string
  } | null
}

interface UsersResponse {
  users?: User[]
  items?: User[]
}

export default function SuperAdminUsersPage() {
  const router = useRouter()
  const { data: users, loading, refetch } = useTableData<User>({
    endpoint: '/api/super-admin/users',
    transform: (data) => (data as UsersResponse).users || (data as UsersResponse).items || (data as User[]) || []
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (userId: string) => {
    router.push(`/super-admin/users/${userId}/edit`)
  }

  const handleDelete = (user: User) => {
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

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
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
      header: "Role",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="space-y-1">
            <RoleBadge role={row.getValue("role")} />
            {user.isExternalUser && (
              <Badge variant="outline" className="text-xs">
                <Users className="mr-1 h-3 w-3" />
                External
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "company.name",
      header: "Company",
      cell: ({ row }) => {
        const user = row.original
        const company = user.company
        const clientCompany = user.clientCompany
        
        if (!company) {
          return <span className="text-muted-foreground">No company</span>
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
                <span>Client: {clientCompany.name}</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Status",
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as boolean
        return (
          <Badge variant={verified ? "default" : "secondary"}>
            {verified ? "Verified" : "Pending"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
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
  ]

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users..."
        title="Users Management (Super Admin)"
        description="Manage all users across all companies and tenants"
        onAdd={handleAddUser}
        addLabel="Invite User"
        loading={loading}
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