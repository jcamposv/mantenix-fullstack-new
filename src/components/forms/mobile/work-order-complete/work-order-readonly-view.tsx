"use client"

import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { WorkOrderCustomFields } from "@/components/mobile/work-order-custom-fields"
import type { CustomField } from "@/schemas/work-order-template"

interface WorkOrderReadonlyViewProps {
  customFields?: { fields: CustomField[] }
  customFieldValues?: Record<string, unknown>
  completionNotes?: string
}

export function WorkOrderReadonlyView({
  customFields,
  customFieldValues,
  completionNotes
}: WorkOrderReadonlyViewProps) {
  // Create a form with existing values for readonly display
  const form = useForm({
    defaultValues: {
      customFieldValues: customFieldValues || {},
      completionNotes: completionNotes || ""
    }
  })

  if (!customFields?.fields && !completionNotes) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trabajo Realizado</CardTitle>
      </CardHeader>
      <CardContent>
        {customFields && (
          <Form {...form}>
            <WorkOrderCustomFields
              customFields={customFields}
              readOnly={true}
            />
          </Form>
        )}
        
        {completionNotes && (
          <>
            {customFields && <Separator className="my-4" />}
            <div>
              <Label className="font-medium">Notas de Finalización</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {completionNotes}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}