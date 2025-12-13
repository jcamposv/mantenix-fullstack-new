"use client"

import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { emailTemplateTypeLabels } from "@/schemas/email-template"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

interface EmailTemplate {
  id: string
  emailConfigurationId: string
  type: string
  name: string
  subject: string
  templateId: string | null
  htmlContent: string | null
  textContent: string | null
  availableVariables: Record<string, unknown> | null
  isActive: boolean
}

interface EmailConfiguration {
  id: string
  company: {
    name: string
    subdomain: string
  }
}

interface TemplatesResponse {
  items: EmailTemplate[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EmailTemplatesPage() {
  const router = useRouter()
  const params = useParams()
  const configId = params.id as string

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch configuration details with SWR
  const { data: configuration } = useSWR<EmailConfiguration>(
    configId ? `/api/admin/email-configurations/${configId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  // Fetch templates with SWR
  const { data: templatesData, error, isLoading, mutate } = useSWR<TemplatesResponse>(
    configId ? `/api/admin/email-templates?emailConfigurationId=${configId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const templates = templatesData?.items || []

  const handleEdit = (templateId: string) => {
    router.push(`/super-admin/email-configurations/${configId}/templates/${templateId}/edit`)
  }

  const handleDelete = (template: EmailTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/email-templates/${templateToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Template desactivado exitosamente')
        setDeleteDialogOpen(false)
        setTemplateToDelete(null)
        // Revalidate SWR cache
        mutate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar el template')
      }
    } catch (error) {
      console.error('Error deleting email template:', error)
      toast.error('Error al desactivar el template')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddTemplate = () => {
    router.push(`/super-admin/email-configurations/${configId}/templates/new`)
  }

  const handleBack = () => {
    router.push('/super-admin/email-configurations')
  }

  const columns: ColumnDef<EmailTemplate>[] = [
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <div>
            <div className="font-medium">{emailTemplateTypeLabels[type] || type}</div>
            <div className="text-sm text-muted-foreground">{row.original.name}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "subject",
      header: "Asunto",
      cell: ({ row }) => {
        return (
          <div className="max-w-md truncate">
            {row.original.subject}
          </div>
        )
      },
    },
    {
      accessorKey: "templateId",
      header: "Template ID",
      cell: ({ row }) => {
        const templateId = row.original.templateId
        return (
          <div className="text-sm">
            {templateId ? (
              <Badge variant="outline">{templateId}</Badge>
            ) : (
              <span className="text-muted-foreground">HTML Personalizado</span>
            )}
          </div>
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
        const template = row.original
        return (
          <TableActions
            actions={[
              createEditAction(() => handleEdit(template.id)),
              createDeleteAction(() => handleDelete(template))
            ]}
          />
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates de Email</h1>
          {configuration && (
            <p className="text-muted-foreground">
              Configuración para {configuration.company.name} ({configuration.company.subdomain})
            </p>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={templates}
        loading={isLoading}
        onAdd={handleAddTemplate}
        addLabel="Nuevo Template"
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Desactivar Template"
        description={`¿Está seguro que desea desactivar el template "${templateToDelete?.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
