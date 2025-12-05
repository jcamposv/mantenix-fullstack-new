"use client";

import { useState, useEffect } from 'react';
import { Loader2, Calendar, Clock, Repeat, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  getRecurrenceTypeLabel, 
  getRecurrenceEndTypeLabel, 
  getMeterTypeLabel,
  type RecurrenceType,
  type RecurrenceEndType,
  type MeterType
} from '@/schemas/work-order-schedule';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ScheduleDetailsProps {
  scheduleId: string;
  onDelete?: () => void;
  onClose?: () => void;
}

interface Schedule {
  name: string;
  description?: string;
  isActive: boolean;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  weekDays?: number[];
  meterType?: MeterType;
  meterThreshold?: number;
  currentMeterReading?: number;
  recurrenceEndType: RecurrenceEndType;
  recurrenceEndValue?: number;
  recurrenceEndDate?: string;
  nextGenerationDate?: string;
  template: { name: string };
  asset?: { name: string; code?: string };
  site?: { name: string };
  totalGenerated: number;
  totalCompleted: number;
  completionRate: number;
}

export function ScheduleDetails({ scheduleId, onDelete, onClose }: ScheduleDetailsProps) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/work-order-schedules/${scheduleId}`)
      if (!response.ok) throw new Error("Error al cargar programación")
      const data = await response.json()
      setSchedule(data)
    } catch (error) {
      console.error("Error fetching schedule:", error)
      toast.error("Error al cargar los detalles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/work-order-schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Programación eliminada exitosamente")
      onDelete?.()
      onClose?.()
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast.error("Error al eliminar la programación")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/work-order-schedules/${scheduleId}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar orden');
      }

      await response.json();
      toast.success('Orden de trabajo generada exitosamente');
      fetchSchedule(); // Refresh to show updated stats
    } catch (error) {
      console.error('Error generating work order:', error);
      toast.error(error instanceof Error ? error.message : 'Error al generar orden');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Programación no encontrada
      </div>
    )
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{schedule.name}</h3>
          {schedule.description && (
            <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
          )}
        </div>
        <Badge variant={schedule.isActive ? "default" : "secondary"}>
          {schedule.isActive ? "Activa" : "Inactiva"}
        </Badge>
      </div>

      <Separator />

      {/* Recurrence Info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Repeat className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Recurrencia</p>
            <p className="text-sm text-muted-foreground">
              {getRecurrenceTypeLabel(schedule.recurrenceType)}
              {schedule.recurrenceInterval > 1 && ` (cada ${schedule.recurrenceInterval})`}
            </p>
            {schedule.recurrenceType === "WEEKLY" && schedule.weekDays && schedule.weekDays.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Días: {schedule.weekDays.map((d: number) =>
                  ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d]
                ).join(", ")}
              </p>
            )}
          </div>
        </div>

        {schedule.recurrenceType === "METER_BASED" && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Medidor</p>
              <p className="text-sm text-muted-foreground">
                {schedule.meterType && getMeterTypeLabel(schedule.meterType)}
                {schedule.meterThreshold && ` - Umbral: ${schedule.meterThreshold}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Lectura actual: {schedule.currentMeterReading}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Finalización</p>
            <p className="text-sm text-muted-foreground">
              {getRecurrenceEndTypeLabel(schedule.recurrenceEndType)}
              {schedule.recurrenceEndType === "AFTER_OCCURRENCES" && schedule.recurrenceEndValue &&
                ` (${schedule.recurrenceEndValue} veces)`
              }
              {schedule.recurrenceEndType === "ON_DATE" && schedule.recurrenceEndDate &&
                ` (${formatDate(schedule.recurrenceEndDate)})`
              }
            </p>
          </div>
        </div>

        {schedule.nextGenerationDate && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Próxima generación</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(schedule.nextGenerationDate)}
              </p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Template and Assignment */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">Template</p>
          <p className="text-sm text-muted-foreground">{schedule.template.name}</p>
        </div>

        {schedule.asset && (
          <div>
            <p className="text-sm font-medium mb-1">Activo</p>
            <p className="text-sm text-muted-foreground">
              {schedule.asset.name} {schedule.asset.code && `(${schedule.asset.code})`}
            </p>
          </div>
        )}

        {schedule.site && (
          <div>
            <p className="text-sm font-medium mb-1">Sede</p>
            <p className="text-sm text-muted-foreground">{schedule.site.name}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold">{schedule.totalGenerated}</p>
          <p className="text-xs text-muted-foreground">Generadas</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold">{schedule.totalCompleted}</p>
          <p className="text-xs text-muted-foreground">Completadas</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold">{schedule.completionRate.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Tasa</p>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={generating || !schedule.isActive}
          className="flex-1"
        >
          {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!generating && <Play className="mr-2 h-4 w-4" />}
          Generar Orden Ahora
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar programación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La programación será eliminada permanentemente.
              Las órdenes de trabajo ya generadas no serán afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
