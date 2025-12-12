"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import {
  workOrderScheduleSchema,
  createEmptyScheduleForm,
  type WorkOrderScheduleFormData,
} from '@/schemas/work-order-schedule';
import { ScheduleBasicInfo } from './schedule-basic-info';
import { RecurrenceConfig } from './recurrence-config';
import { MeterConfig } from './meter-config';
import { RecurrenceEndConfig } from './recurrence-end-config';
import { ScheduleAssignments } from './schedule-assignments';

interface ScheduleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDate?: Date;
}

interface Template {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  name: string;
  code?: string;
}

interface Site {
  id: string;
  name: string;
}

export function ScheduleForm({ onSuccess, onCancel, initialDate }: ScheduleFormProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [dataLoading, setDataLoading] = useState(true)

  const form = useForm<WorkOrderScheduleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(workOrderScheduleSchema) as any,
    defaultValues: createEmptyScheduleForm(),
  })

  // Set initial date if provided
  useEffect(() => {
    if (initialDate) {
      form.setValue('startDate', initialDate.toISOString().split('T')[0]);
    }
  }, [initialDate, form]);

  // Fetch templates, assets, and sites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [templatesRes, assetsRes, sitesRes] = await Promise.all([
          fetch("/api/work-order-templates?page=1&limit=100"),
          fetch("/api/admin/assets?page=1&limit=100"),
          fetch("/api/admin/sites?page=1&limit=100"),
        ])

        if (templatesRes.ok) {
          const data = await templatesRes.json()
          setTemplates(data.items || [])
        }

        if (assetsRes.ok) {
          const data = await assetsRes.json()
          setAssets(data.items || [])
        }

        if (sitesRes.ok) {
          const data = await sitesRes.json()
          setSites(data.items || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar datos del formulario")
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (values: WorkOrderScheduleFormData) => {
    try {
      setLoading(true)

      const response = await fetch("/api/work-order-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear programación")
      }

      toast.success("Programación creada exitosamente")
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear programación")
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <ScheduleBasicInfo form={form} templates={templates} />

        <Separator />

        {/* Recurrence Configuration */}
        <RecurrenceConfig form={form} />

        {/* Meter Configuration (only shown if recurrenceType is METER_BASED) */}
        <MeterConfig form={form} />

        <Separator />

        {/* End Configuration */}
        <RecurrenceEndConfig form={form} />

        <Separator />

        {/* Assignments */}
        <ScheduleAssignments form={form} assets={assets} sites={sites} />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Programación
          </Button>
        </div>
      </form>
    </Form>
  )
}
