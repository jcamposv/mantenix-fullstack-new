/**
 * Work Order Cost Breakdown Card
 *
 * Displays automatic cost calculation and allows authorized users to adjust other costs
 * Following CMMS best practices for cost tracking
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Edit2, Save, X, Calculator } from "lucide-react"
import { toast } from "sonner"

interface WorkOrderCostBreakdownProps {
  workOrderId: string
  laborCost: number | null
  partsCost: number | null
  otherCosts: number | null
  actualCost: number | null
  status: string
  canEdit?: boolean // Only jefe/admin can edit
}

export function WorkOrderCostBreakdownCard({
  workOrderId,
  laborCost,
  partsCost,
  otherCosts,
  actualCost,
  status,
  canEdit = false,
}: WorkOrderCostBreakdownProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editedOtherCosts, setEditedOtherCosts] = useState<string>(
    otherCosts?.toString() || "0"
  )
  const [isSaving, setIsSaving] = useState(false)

  // Only show if work order is completed
  if (status !== "COMPLETED") {
    return null
  }

  const formatCurrency = (amount: number | null): string => {
    if (amount === null || amount === undefined) return "₡0.00"
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true)

      const newOtherCosts = parseFloat(editedOtherCosts) || 0

      if (newOtherCosts < 0) {
        toast.error("El costo no puede ser negativo")
        return
      }

      const response = await fetch(`/api/work-orders/${workOrderId}/costs`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otherCosts: newOtherCosts,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar costos")
      }

      toast.success("Costos actualizados correctamente")
      setIsEditing(false)
      router.refresh() // Refresh server component data
    } catch (error) {
      console.error("Error updating costs:", error)
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar costos"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = (): void => {
    setEditedOtherCosts(otherCosts?.toString() || "0")
    setIsEditing(false)
  }

  const currentLaborCost = laborCost || 0
  const currentPartsCost = partsCost || 0
  const currentOtherCosts = isEditing
    ? parseFloat(editedOtherCosts) || 0
    : otherCosts || 0
  const totalCost = currentLaborCost + currentPartsCost + currentOtherCosts

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Desglose de Costos</CardTitle>
              <CardDescription>
                Costos calculados automáticamente al completar la orden
              </CardDescription>
            </div>
          </div>
          {canEdit && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Ajustar Costos
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Labor Cost */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Mano de Obra</p>
              <p className="text-xs text-muted-foreground">
                Calculado automáticamente
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatCurrency(currentLaborCost)}</p>
            <Badge variant="secondary" className="text-xs">
              Auto
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Parts Cost */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Repuestos</p>
              <p className="text-xs text-muted-foreground">
                Desde solicitudes entregadas
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatCurrency(currentPartsCost)}</p>
            <Badge variant="secondary" className="text-xs">
              Auto
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Other Costs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Otros Costos</p>
              <p className="text-xs text-muted-foreground">
                Transporte, contratistas, etc.
              </p>
            </div>
          </div>
          <div className="text-right">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedOtherCosts}
                  onChange={(e) => setEditedOtherCosts(e.target.value)}
                  className="w-32 text-right"
                  placeholder="0.00"
                />
              </div>
            ) : (
              <>
                <p className="text-lg font-semibold">
                  {formatCurrency(currentOtherCosts)}
                </p>
                <Badge variant="outline" className="text-xs">
                  Manual
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}

        <Separator />

        {/* Total Cost */}
        <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3">
          <p className="text-base font-bold">Total</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(totalCost)}
          </p>
        </div>

        {/* Info Note */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p className="font-medium mb-1">Cálculo Automático:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Mano de obra: Tiempo activo × tarifa por hora</li>
            <li>Repuestos: Suma de items entregados × precio unitario</li>
            <li>Otros costos: Ajustable manualmente por jefe/admin</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
