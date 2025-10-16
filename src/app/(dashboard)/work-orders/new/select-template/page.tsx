"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, Settings, ArrowLeft, FileText, Plus } from "lucide-react"
import { useTableData } from "@/components/hooks/use-table-data"
import { TemplatePreviewModal } from "@/components/work-orders/template-preview-modal"
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

export default function SelectTemplatePage() {
  console.log("SelectTemplatePage component loaded")
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplateWithRelations | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const { data: templates, loading } = useTableData<WorkOrderTemplateWithRelations>({
    endpoint: '/api/work-order-templates',
    transform: (data) => (data as WorkOrderTemplatesResponse).templates || (data as WorkOrderTemplatesResponse).items || (data as WorkOrderTemplateWithRelations[]) || []
  })

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/work-orders/new?templateId=${templateId}`)
  }

  const handleCreateWithoutTemplate = () => {
    router.push("/work-orders/new")
  }

  const handleViewTemplate = (template: WorkOrderTemplateWithRelations) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setSelectedTemplate(null)
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
      header: "Campos Personalizados",
      cell: ({ row }) => {
        const template = row.original
        const fieldsCount = (template.customFields as { fields?: unknown[] })?.fields?.length || 0
        
        return (
          <div className="space-y-1">
            <div className="flex items-center">
              <Settings className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-sm">
                {fieldsCount} campo(s)
              </span>
            </div>
            {fieldsCount > 0 && (
              <div className="text-xs text-muted-foreground">
                Campos personalizados configurados
              </div>
            )}
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
      header: "Acciones",
      cell: ({ row }) => {
        const template = row.original
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewTemplate(template)}
            >
              <FileText className="mr-1 h-3 w-3" />
              Ver
            </Button>
            <Button
              size="sm"
              onClick={() => handleSelectTemplate(template.id)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Usar
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Seleccionar Template</h1>
            <p className="text-muted-foreground">
              Elige un template para crear tu orden de trabajo o continúa sin template
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Quick action card */}
        <Card>
          <CardHeader>
            <CardTitle>¿Quieres crear sin template?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Puedes crear una orden de trabajo completamente personalizada sin usar ningún template.
            </p>
            <Button 
              variant="outline" 
              onClick={handleCreateWithoutTemplate}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Sin Template
            </Button>
          </CardContent>
        </Card>

        {/* Templates table */}
        <Card>
          <CardHeader>
            <CardTitle>Templates Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={templates}
              searchKey="name"
              searchPlaceholder="Buscar templates..."
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        open={showPreview}
        onClose={handleClosePreview}
        onSelect={handleSelectTemplate}
      />
    </div>
  )
}