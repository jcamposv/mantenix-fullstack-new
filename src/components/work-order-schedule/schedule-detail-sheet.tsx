"use client"

import { Loader2, Save, Trash2 } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Form } from "@/components/ui/form"
import { useScheduleDetail } from "@/hooks/use-schedule-detail"
import { ScheduleInfoSection } from "./schedule-info-section"
import { ScheduleAssignmentSection } from "./schedule-assignment-section"
import type { ScheduleDetailFormData } from "@/schemas/schedule-detail.schema"

interface ScheduleDetailSheetProps {
  scheduleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * ScheduleDetailSheet
 * Outlook Calendar-style side panel for viewing and editing schedules
 * All information and actions in one place - no navigation
 * Composable: uses smaller components for info and assignments
 * Max 200 lines per nextjs-expert standards
 */
export function ScheduleDetailSheet({
  scheduleId,
  open,
  onOpenChange,
  onSuccess,
}: ScheduleDetailSheetProps) {
  const { form, loading, saving, schedule, onSubmit, handleDelete } = useScheduleDetail({
    scheduleId,
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    },
  })

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col gap-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle>Detalles de Programación</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !schedule ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No se pudo cargar la programación</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 overflow-hidden px-6">
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-6 py-6">
                  {/* Basic Information Section */}
                  <ScheduleInfoSection form={form as UseFormReturn<ScheduleDetailFormData>} schedule={schedule} />

                  <Separator />

                  {/* Assignment Section */}
                  <ScheduleAssignmentSection form={form as UseFormReturn<ScheduleDetailFormData>} />
                </form>
              </Form>
            </ScrollArea>

            {/* Footer Actions */}
            <SheetFooter className="px-6 py-4 border-t shrink-0 flex-row justify-between gap-2 mt-0">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={onSubmit} disabled={saving || loading}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
