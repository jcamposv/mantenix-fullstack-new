"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Building2, Plus, Users } from "lucide-react"
import { toast } from "sonner"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

interface CompanyGroup {
  id: string
  name: string
  description: string | null
  shareInventory: boolean
  autoApproveTransfers: boolean
  isActive: boolean
  _count: {
    companies: number
  }
}

interface CompanyGroupsResponse {
  companyGroups: CompanyGroup[]
  total: number
}

export default function CompanyGroupsPage() {
  const router = useRouter()
  const { data: groups, loading, refetch } = useTableData<CompanyGroup>({
    endpoint: '/api/admin/company-groups',
    transform: (data) => (data as CompanyGroupsResponse).companyGroups || []
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<CompanyGroup | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddGroup = () => {
    router.push("/admin/company-groups/new")
  }

  const handleEdit = (groupId: string) => {
    router.push(`/admin/company-groups/${groupId}/edit`)
  }

  const handleDelete = (group: CompanyGroup) => {
    setGroupToDelete(group)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!groupToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/company-groups/${groupToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Grupo corporativo eliminado exitosamente')
        setDeleteDialogOpen(false)
        setGroupToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el grupo')
      }
    } catch (error) {
      console.error('Error deleting company group:', error)
      toast.error('Error al eliminar el grupo')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<CompanyGroup>[] = [
    {
      accessorKey: "name",
      header: "Grupo Corporativo",
      cell: ({ row }) => {
        const group = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{group.name}</span>
            </div>
            {group.description && (
              <div className="text-sm text-muted-foreground truncate max-w-md">
                {group.description}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "_count.companies",
      header: "Empresas",
      cell: ({ row }) => {
        const group = row.original
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{group._count.companies}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "shareInventory",
      header: "Inventario Compartido",
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.shareInventory ? "default" : "secondary"}>
            {row.original.shareInventory ? "Sí" : "No"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "autoApproveTransfers",
      header: "Auto-Aprobar Transferencias",
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.autoApproveTransfers ? "default" : "secondary"}>
            {row.original.autoApproveTransfers ? "Sí" : "No"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Activo" : "Inactivo"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const group = row.original
        return (
          <TableActions
            actions={[
              createEditAction(() => handleEdit(group.id)),
              createDeleteAction(() => handleDelete(group))
            ]}
          />
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grupos Corporativos</h2>
          <p className="text-muted-foreground">
            Gestiona grupos de empresas hermanas
          </p>
        </div>
        <Button onClick={handleAddGroup}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Grupo
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={groups}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Buscar por nombre..."
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar grupo corporativo?"
        description={
          groupToDelete
            ? `¿Estás seguro de que deseas eliminar "${groupToDelete.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Eliminar"
        loading={isDeleting}
      />
    </div>
  )
}
