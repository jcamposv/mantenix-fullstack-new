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
  workOrderId: string
  initialValues?: Partial<MobileCompleteWorkOrderData>
  onSubmit: (data: MobileCompleteWorkOrderData) => Promise<void>
  onCancel: (notes?: string) => Promise<void>
  isSubmitting?: boolean
}

export function WorkOrderCompleteForm({
  customFields,
  workOrderId,
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
      <form onSubmit={handleSubmit} className="space-y-5">
        {customFields && (
          <>
            <WorkOrderCustomFields
              customFields={customFields}
              workOrderId={workOrderId}
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
              <FormLabel className="text-base font-semibold">Notas de Finalización</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el trabajo realizado, observaciones, problemas encontrados..."
                  rows={4}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Info callout */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
          <p className="font-medium text-foreground mb-1">
            <CheckCircle2 className="h-4 w-4 inline mr-1.5 text-primary" />
            Completar Orden de Trabajo
          </p>
          <p className="text-muted-foreground text-xs">
            Al confirmar, se finalizará el tracking de tiempo y se marcará la orden de trabajo como completada.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full h-14 font-semibold shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            )}
            Completar Orden de Trabajo
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            variant="outline"
            size="lg"
            className="w-full h-12 font-medium border-2"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Cancelar Orden
          </Button>
        </div>
      </form>
    </Form>
  )
}