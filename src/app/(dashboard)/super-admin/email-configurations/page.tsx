"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { toast } from "sonner"
import { Mail, FileText } from "lucide-react"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

interface EmailConfiguration {
  id: string
  companyId: string
  fromEmail: string
  fromName: string
  replyToEmail: string | null
  isActive: boolean
  company: {
    id: string
    name: string
    subdomain: string
  } | null
  _count: {
    emailTemplates: number
  }
}

interface EmailConfigurationsResponse {
  configurations?: EmailConfiguration[]
  items?: EmailConfiguration[]
}

export default function EmailConfigurationsPage() {
  const router = useRouter()
  const { data: configurations, loading, refetch } = useTableData<EmailConfiguration>({
    endpoint: '/api/admin/email-configurations',
    transform: (data) => (data as EmailConfigurationsResponse).configurations || (data as EmailConfigurationsResponse).items || (data as EmailConfiguration[]) || []
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [configToDelete, setConfigToDelete] = useState<EmailConfiguration | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (configId: string) => {
    router.push(`/super-admin/email-configurations/${configId}/edit`)
  }

  const handleDelete = (config: EmailConfiguration) => {
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

  const columns: ColumnDef<EmailConfiguration>[] = [
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
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuraciones de Email</h1>
          <p className="text-muted-foreground">
            Gestiona las configuraciones de MailerSend para cada empresa
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={configurations}
        loading={loading}
        onAdd={handleAddConfiguration}
        addLabel="Nueva Configuración"
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
