"use client"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Control } from "react-hook-form"
import { EmailTemplateFormData, emailTemplateTypeLabels } from "@/schemas/email-template"

interface EmailTemplateBasicInfoProps {
  control: Control<EmailTemplateFormData>
  mode: "create" | "edit"
}

const templateTypes = Object.keys(emailTemplateTypeLabels) as Array<keyof typeof emailTemplateTypeLabels>

export function EmailTemplateBasicInfo({ control, mode }: EmailTemplateBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type Selection */}
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Template</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={mode === "edit"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templateTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {emailTemplateTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {mode === "edit" ? "El tipo no puede ser modificado" : "Tipo de email que se enviará"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Template</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Bienvenida usuarios nuevos" {...field} />
              </FormControl>
              <FormDescription>
                Nombre descriptivo para identificar el template
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subject */}
        <FormField
          control={control}
          name="subject"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Asunto del Email</FormLabel>
              <FormControl>
                <Input placeholder="Bienvenido a {{company_name}}" {...field} />
              </FormControl>
              <FormDescription>
                Asunto del email. Puedes usar variables como {`{{variable_name}}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Template ID */}
        <FormField
          control={control}
          name="templateId"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Template ID de MailerSend (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="v69oxl5rk8pg785k" {...field} />
              </FormControl>
              <FormDescription>
                ID del template creado en MailerSend
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Is Active */}
      <FormField
        control={control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Template Activo
              </FormLabel>
              <FormDescription>
                Si está activo, este template se usará para enviar emails
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
