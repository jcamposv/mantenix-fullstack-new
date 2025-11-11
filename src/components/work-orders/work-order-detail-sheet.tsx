"use client"

import { Loader2, Save, Trash2 } from "lucide-react"
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
import { useWorkOrderDetail } from "@/hooks/use-work-order-detail"
import { WorkOrderInfoSection } from "./work-order-info-section"
import { WorkOrderAssignmentSection } from "./work-order-assignment-section"

interface WorkOrderDetailSheetProps {
  workOrderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * WorkOrderDetailSheet
 * Outlook Calendar-style side panel for viewing and editing work orders
 * All information and actions in one place - no navigation
 * Composable: uses smaller components for info and assignments
 * Max 200 lines per nextjs-expert standards
 */
export function WorkOrderDetailSheet({
  workOrderId,
  open,
  onOpenChange,
  onSuccess,
}: WorkOrderDetailSheetProps) {
  const { form, loading, saving, workOrder, onSubmit, handleDelete } = useWorkOrderDetail({
    workOrderId,
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
          <SheetTitle>Detalles de Orden de Trabajo</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !workOrder ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No se pudo cargar la orden</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 overflow-hidden px-6">
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-6 py-6">
                  {/* Basic Information Section */}
                  <WorkOrderInfoSection form={form} workOrder={workOrder} />

                  <Separator />

                  {/* Assignment Section */}
                  <WorkOrderAssignmentSection form={form} />
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
                <Button
                  type="button"
                  size="sm"
                  onClick={onSubmit}
                  disabled={saving || loading}
                >
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
