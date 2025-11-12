"use client"

import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { UserAssignmentSection } from "@/components/common/user-assignment-section"
import { type ScheduleDetailFormData } from "@/schemas/schedule-detail.schema"

interface ScheduleAssignmentSectionProps {
  form: UseFormReturn<ScheduleDetailFormData>
}

/**
 * ScheduleAssignmentSection
 * Wrapper for UserAssignmentSection specific to schedules
 * Uses FormField for proper React Hook Form integration
 * Max 200 lines per nextjs-expert standards
 */
export function ScheduleAssignmentSection({ form }: ScheduleAssignmentSectionProps) {
  return (
    <FormField
      control={form.control}
      name="assignedUserIds"
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
