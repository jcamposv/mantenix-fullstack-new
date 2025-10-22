"use client"

import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { User, Calendar, Settings } from "lucide-react"
import { toast } from "sonner"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import type { WorkOrderTemplateWithRelations, WorkOrderTemplatesResponse } from "@/types/work-order-template.types"


const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "default"
    case "INACTIVE":
      return "secondary"
    default:
      return "outline"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Activo"
    case "INACTIVE":
      return "Inactivo"
    default:
      return status
  }
}

export default function WorkOrderTemplatesPage() {
  const router = useRouter()
  const { data: templates, loading, refetch } = useTableData<WorkOrderTemplateWithRelations>({
    endpoint: '/api/work-order-templates',
    transform: (data) => (data as WorkOrderTemplatesResponse).templates || (data as WorkOrderTemplatesResponse).items || (data as WorkOrderTemplateWithRelations[]) || []
  })

  const handleAddTemplate = () => {
    router.push("/admin/work-order-templates/new")
  }

  const handleEdit = (templateId: string) => {
    router.push(`/admin/work-order-templates/${templateId}/edit`)
  }

  const handleDelete = async (template: WorkOrderTemplateWithRelations) => {
    if (confirm(`¿Está seguro que desea desactivar el template "${template.name}"?`)) {
      try {
        const response = await fetch(`/api/work-order-templates/${template.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const result = await response.json()
          toast.success(result.message || 'Template desactivado exitosamente')
          refetch()
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al desactivar el template')
        }
      } catch (error) {
        console.error('Error deleting template:', error)
        toast.error('Error al desactivar el template')
      }
    }
  }

  const columns: ColumnDef<WorkOrderTemplateWithRelations>[] = [
    {
      accessorKey: "name",
      header: "Template",
      cell: ({ row }) => {
        const template = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{template.name}</div>
            {template.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </div>
            )}
            {template.category && (
              <div className="text-xs text-muted-foreground">
                {template.category}
              </div>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {getStatusLabel(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "customFields",
      header: "Campos",
      cell: ({ row }) => {
        const template = row.original
        const fieldsCount = template.customFields?.fields?.length || 0
        
        return (
          <div className="flex items-center">
            <Settings className="mr-1 h-3 w-3 text-muted-foreground" />
            <span className="text-sm">
              {fieldsCount} campo(s)
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "creator",
      header: "Creado por",
      cell: ({ row }) => {
        const template = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center">
              <User className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{template.creator?.name}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {new Date(template.createdAt).toLocaleDateString()}
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const template = row.original
        const actions = [
          createEditAction(() => handleEdit(template.id)),
          createDeleteAction(() => handleDelete(template))
        ]
        
        return <TableActions actions={actions} />
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={columns}
        data={templates}
        searchKey="name"
        searchPlaceholder="Buscar templates..."
        title="Templates de Órdenes de Trabajo"
        description="Gestionar templates para crear órdenes de trabajo estandarizadas"
        onAdd={handleAddTemplate}
        addLabel="Crear Template"
        loading={loading}
      />
    </div>
  )
}