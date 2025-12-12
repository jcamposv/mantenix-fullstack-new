"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, Wrench, XCircle, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ASSET_STATUS_OPTIONS, STATUS_CHANGE_REASONS, changeAssetStatusSchema } from "@/schemas/asset-status"
import type { ChangeAssetStatusData } from "@/schemas/asset-status"
import { AssetStatusBadge } from "./asset-status-badge"

type AssetStatus = "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"

interface ChangeAssetStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ChangeAssetStatusData) => Promise<void>
  assetId: string
  assetName: string
  currentStatus: AssetStatus
  workOrderId?: string
  isLoading?: boolean
}

export function ChangeAssetStatusDialog({
  open,
  onOpenChange,
  onSubmit,
  assetId,
  assetName,
  currentStatus,
  workOrderId,
  isLoading = false
}: ChangeAssetStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | undefined>()
  const [reasonOptions, setReasonOptions] = useState<readonly string[]>([])

  const form = useForm<ChangeAssetStatusData>({
    resolver: zodResolver(changeAssetStatusSchema),
    defaultValues: {
      assetId,
      status: undefined,
      reason: "",
      notes: "",
      workOrderId,
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        assetId,
        status: undefined,
        reason: "",
        notes: "",
        workOrderId,
      })
      setSelectedStatus(undefined)
      setReasonOptions([])
    }
  }, [open, assetId, workOrderId, form])

  // Update reason options when status changes
  useEffect(() => {
    if (selectedStatus) {
      switch (selectedStatus) {
        case "EN_MANTENIMIENTO":
          setReasonOptions(STATUS_CHANGE_REASONS.TO_MAINTENANCE)
          break
        case "OPERATIVO":
          setReasonOptions(STATUS_CHANGE_REASONS.TO_OPERATIONAL)
          break
        case "FUERA_DE_SERVICIO":
          setReasonOptions(STATUS_CHANGE_REASONS.TO_OUT_OF_SERVICE)
          break
        default:
          setReasonOptions([])
      }
      // Reset reason when status changes
      form.setValue("reason", "")
    }
  }, [selectedStatus, form])

  const handleSubmit = async (data: ChangeAssetStatusData) => {
    await onSubmit(data)
    form.reset()
    setSelectedStatus(undefined)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPERATIVO":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "EN_MANTENIMIENTO":
        return <Wrench className="h-4 w-4 text-yellow-600" />
      case "FUERA_DE_SERVICIO":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // Filter out current status from available options
  const availableStatuses = ASSET_STATUS_OPTIONS.filter(
    option => option.value !== currentStatus
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Activo</DialogTitle>
          <DialogDescription>
            Actualiza el estado de {assetName}
          </DialogDescription>
        </DialogHeader>

        {/* Current Status Display */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">Estado actual:</span>
              <AssetStatusBadge status={currentStatus} />
            </div>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* New Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo Estado *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedStatus(value as AssetStatus)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el nuevo estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStatuses.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(option.value)}
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason Selection (conditional) */}
            {selectedStatus && reasonOptions.length > 0 && (
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un motivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reasonOptions.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Añade detalles sobre el cambio de estado..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !selectedStatus}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cambiar Estado
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
