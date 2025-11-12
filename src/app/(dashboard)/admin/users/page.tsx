"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { toast } from "sonner"
import { UserAvatar } from "@/components/common/user-avatar"
import { RoleBadge } from "@/components/common/role-badge"
import { TableActions, createEditAction, createDeleteAction, createResetPasswordAction } from "@/components/common/table-actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useTableData } from "@/components/hooks/use-table-data"

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string
  image: string | null
  createdAt: string
  company: {
    id: string
    name: string
    subdomain: string
  } | null
}

interface UsersResponse {
  users?: User[]
  items?: User[]
}

export default function UsersPage() {
  const router = useRouter()
  const { data: users, loading, refetch } = useTableData<User>({
    endpoint: '/api/admin/users',
    transform: (data) => (data as UsersResponse).users || (data as UsersResponse).items || (data as User[]) || []
  })

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  })
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  })

  const handleAddUser = () => {
    router.push("/admin/users/new")
  }

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  const handleDelete = (user: User) => {
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

  const handleResetPassword = (user: User) => {
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

  const columns: ColumnDef<User>[] = [
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
        return <RoleBadge role={row.getValue("role")} />
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
          createEditAction(() => handleEdit(user.id)),
          createResetPasswordAction(() => handleResetPassword(user)),
          createDeleteAction(() => handleDelete(user))
        ]

        return <TableActions actions={actions} />
      },
    },
]

  return (
    <div className="container mx-auto py-0">
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Buscar usuarios..."
        title="Usuarios"
        description="Gestionar todos los usuarios del sistema"
        onAdd={handleAddUser}
        addLabel="Agregar Usuario"
        loading={loading}
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