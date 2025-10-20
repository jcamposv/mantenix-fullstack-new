"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { WorkOrderCustomFields } from "@/components/mobile/work-order-custom-fields"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { 
  createMobileCompleteWorkOrderSchema, 
  type MobileCompleteWorkOrderData 
} from "@/schemas/mobile-work-order"
import type { CustomField } from "@/schemas/work-order-template"

interface WorkOrderCompleteFormProps {
  customFields?: { fields: CustomField[] }
  initialValues?: Partial<MobileCompleteWorkOrderData>
  onSubmit: (data: MobileCompleteWorkOrderData) => Promise<void>
  onCancel: (notes?: string) => Promise<void>
  isSubmitting?: boolean
}

export function WorkOrderCompleteForm({
  customFields,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false
}: WorkOrderCompleteFormProps) {
  const dynamicSchema = createMobileCompleteWorkOrderSchema(customFields)
  
  const form = useForm<MobileCompleteWorkOrderData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      customFieldValues: {},
      completionNotes: "",
      observations: "",
      actualDuration: undefined,
      actualCost: undefined,
      ...initialValues
    }
  })

  const handleCancel = async () => {
    const formData = form.getValues()
    await onCancel(formData.completionNotes)
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {customFields && (
          <>
            <WorkOrderCustomFields
              customFields={customFields}
              readOnly={false}
            />
            <Separator />
          </>
        )}
        
        <FormField
          control={form.control}
          name="completionNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas de Finalización</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el trabajo realizado, observaciones, problemas encontrados..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            variant="destructive"
            className="flex-1"
            size="sm"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
            size="sm"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Completar
          </Button>
        </div>
      </form>
    </Form>
  )
}