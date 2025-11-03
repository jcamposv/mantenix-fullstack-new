"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Settings, FileText, Plus, Search, LayoutTemplate, Clock } from "lucide-react"
import { useTableData } from "@/components/hooks/use-table-data"
import { TemplatePreviewModal } from "@/components/work-orders/template-preview-modal"
import type { WorkOrderTemplateWithRelations, WorkOrderTemplatesResponse } from "@/types/work-order-template.types"
import { CardListSkeleton } from "@/components/skeletons"

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
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplateWithRelations | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
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

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeTemplates = filteredTemplates.filter(template => template.status === "ACTIVE")

  return (
    <div className="container mx-auto py-0 max-w-7xl">
      <div className="mb-6">      
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seleccionar Template</h1>
            <p className="text-muted-foreground mt-2">
              Elige un template para acelerar la creación de tu orden de trabajo
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates por nombre, descripción o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Templates grid */}
        {loading ? (
          <CardListSkeleton count={6} showFooter={true} showHeader={true} />
        ) : (
          <div>
            {activeTemplates.length === 0 ? (
              <div className="text-center py-12">
                <LayoutTemplate className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  {searchTerm ? "No se encontraron templates" : "No hay templates disponibles"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "Intenta con otros términos de búsqueda" 
                    : "Los administradores pueden crear templates para acelerar la creación de órdenes"
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Opciones Disponibles ({activeTemplates.length + 1})
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Create without template option */}
                  <Card className="border-dashed hover:border-solid transition-colors">
                    <CardHeader>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Plus className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">Crear sin Template</CardTitle>
                          <CardDescription className="mt-1">
                            Crea una orden de trabajo completamente personalizada desde cero
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button onClick={handleCreateWithoutTemplate} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Orden de Trabajo
                      </Button>
                    </CardFooter>
                  </Card>

                  {activeTemplates.map((template) => {
                    const fieldsCount = (template.customFields as { fields?: unknown[] })?.fields?.length || 0
                    
                    return (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              {template.category && (
                                <Badge variant="outline" className="mt-2">
                                  {template.category}
                                </Badge>
                              )}
                            </div>
                            <Badge variant={getStatusBadgeVariant(template.status)}>
                              {getStatusLabel(template.status)}
                            </Badge>
                          </div>
                          {template.description && (
                            <CardDescription className="line-clamp-2">
                              {template.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-3">
                            {/* Custom fields info */}
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>{fieldsCount} campo(s) personalizado(s)</span>
                            </div>
                            
                            <Separator />
                            
                            {/* Creator and date */}
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                <span>{template.creator?.name}</span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4" />
                                <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter>
                          <div className="flex gap-2 w-full">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleViewTemplate(template)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Vista Previa
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={() => handleSelectTemplate(template.id)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Usar Template
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
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