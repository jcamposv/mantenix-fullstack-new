"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { emailConfigurationSchema, EmailConfigurationFormData, EmailConfigurationSubmitData } from "@/schemas/email-configuration"
import { EmailConfigurationBasicInfo } from "./email-configuration-basic-info"

interface EmailConfigurationFormProps {
  onSubmit: (data: EmailConfigurationSubmitData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<EmailConfigurationFormData>
  mode?: "create" | "edit"
}

export function EmailConfigurationForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  mode = "create"
}: EmailConfigurationFormProps) {

  const form = useForm<EmailConfigurationFormData>({
    resolver: zodResolver(emailConfigurationSchema),
    defaultValues: {
      companyId: initialData?.companyId || "",
      apiToken: initialData?.apiToken || "",
      domainId: initialData?.domainId || "",
      fromEmail: initialData?.fromEmail || "",
      fromName: initialData?.fromName || "",
      replyToEmail: initialData?.replyToEmail || "",
    },
  })

  const handleSubmit = (data: EmailConfigurationFormData) => {
    onSubmit(data)
  }

  return (
    <Card className="w-full mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Editar Configuración de Email" : "Nueva Configuración de Email"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* Información Básica */}
            <EmailConfigurationBasicInfo control={form.control} mode={mode} />

            {/* Acciones */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? (mode === "edit" ? "Actualizando..." : "Creando...")
                  : (mode === "edit" ? "Actualizar Configuración" : "Crear Configuración")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
