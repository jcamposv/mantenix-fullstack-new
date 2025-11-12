"use client"

import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { UserAssignmentSection } from "@/components/common/user-assignment-section"
import { type WorkOrderDetailFormData } from "@/schemas/work-order-detail.schema"

interface WorkOrderAssignmentSectionProps {
  form: UseFormReturn<WorkOrderDetailFormData>
}

/**
 * WorkOrderAssignmentSection
 * Wrapper for UserAssignmentSection specific to work orders
 * Uses FormField for proper React Hook Form integration
 * Max 200 lines per nextjs-expert standards
 */
export function WorkOrderAssignmentSection({ form }: WorkOrderAssignmentSectionProps) {
  return (
    <FormField
      control={form.control}
      name="technicianIds"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <UserAssignmentSection
              selectedUserIds={field.value}
              onUserIdsChange={field.onChange}
              title="Asignación de Personal"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
