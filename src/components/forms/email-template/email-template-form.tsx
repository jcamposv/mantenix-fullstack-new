"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { emailTemplateFormSchema, EmailTemplateFormData, EmailTemplateSubmitData } from "@/schemas/email-template"
import { EmailTemplateBasicInfo } from "./email-template-basic-info"

interface EmailTemplateFormProps {
  onSubmit: (data: EmailTemplateSubmitData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<EmailTemplateFormData>
  emailConfigurationId: string
  mode?: "create" | "edit"
}

export function EmailTemplateForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  emailConfigurationId,
  mode = "create"
}: EmailTemplateFormProps) {

  const form = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: {
      emailConfigurationId,
      type: initialData?.type || "WELCOME",
      name: initialData?.name || "",
      subject: initialData?.subject || "",
      templateId: initialData?.templateId || "",
      isActive: initialData?.isActive ?? true,
    },
  })

  const handleSubmit = (data: EmailTemplateFormData) => {
    onSubmit(data)
  }

  return (
    <Card className="w-full mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Editar Template de Email" : "Nuevo Template de Email"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* Información Básica */}
            <EmailTemplateBasicInfo control={form.control} mode={mode} />

            {/* Acciones */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? (mode === "edit" ? "Actualizando..." : "Creando...")
                  : (mode === "edit" ? "Actualizar Template" : "Crear Template")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
