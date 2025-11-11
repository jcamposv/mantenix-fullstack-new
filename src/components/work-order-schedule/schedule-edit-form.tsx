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
  type WorkOrderScheduleFormData,
} from '@/schemas/work-order-schedule';
import { ScheduleBasicInfo } from './schedule-basic-info';
import { RecurrenceConfig } from './recurrence-config';
import { MeterConfig } from './meter-config';
import { RecurrenceEndConfig } from './recurrence-end-config';
import { ScheduleAssignments } from './schedule-assignments';

interface ScheduleEditFormProps {
  scheduleId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
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

interface ScheduleData {
  name: string;
  description?: string;
  recurrenceType: string;
  recurrenceInterval: number;
  recurrenceEndType: string;
  recurrenceEndValue?: number;
  recurrenceEndDate?: string;
  weekDays?: number[];
  meterType?: string;
  meterThreshold?: number;
  templateId: string;
  assetId?: string;
  siteId?: string;
  assignedUserIds?: string[];
  startDate?: string;
}

export function ScheduleEditForm({ scheduleId, onSuccess, onCancel }: ScheduleEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const form = useForm<WorkOrderScheduleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(workOrderScheduleSchema) as any,
  });

  // Fetch schedule data and options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [scheduleRes, templatesRes, assetsRes, sitesRes] = await Promise.all([
          fetch(`/api/work-order-schedules/${scheduleId}`),
          fetch("/api/work-order-templates?page=1&limit=100"),
          fetch("/api/admin/assets?page=1&limit=100"),
          fetch("/api/admin/sites?page=1&limit=100"),
        ]);

        if (!scheduleRes.ok) {
          throw new Error("Error al cargar programación");
        }

        const scheduleData: ScheduleData = await scheduleRes.json();

        // Set form values
        form.reset({
          name: scheduleData.name,
          description: scheduleData.description || "",
          recurrenceType: scheduleData.recurrenceType as WorkOrderScheduleFormData['recurrenceType'],
          recurrenceInterval: scheduleData.recurrenceInterval,
          recurrenceEndType: scheduleData.recurrenceEndType as WorkOrderScheduleFormData['recurrenceEndType'],
          recurrenceEndValue: scheduleData.recurrenceEndValue,
          recurrenceEndDate: scheduleData.recurrenceEndDate,
          weekDays: scheduleData.weekDays || [],
          meterType: scheduleData.meterType as WorkOrderScheduleFormData['meterType'],
          meterThreshold: scheduleData.meterThreshold,
          templateId: scheduleData.templateId,
          assetId: scheduleData.assetId,
          siteId: scheduleData.siteId,
          assignedUserIds: scheduleData.assignedUserIds || [],
          startDate: scheduleData.startDate || new Date().toISOString().split('T')[0],
        });

        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setTemplates(data.templates || []);
        }

        if (assetsRes.ok) {
          const data = await assetsRes.json();
          setAssets(data.assets || []);
        }

        if (sitesRes.ok) {
          const data = await sitesRes.json();
          setSites(data.sites || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar datos");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [scheduleId, form]);

  const onSubmit = async (values: WorkOrderScheduleFormData) => {
    try {
      setLoading(true);

      console.log("Submitting schedule update with values:", values);
      console.log("Assigned user IDs:", values.assignedUserIds);

      const response = await fetch(`/api/work-order-schedules/${scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Update failed:", error);
        throw new Error(error.error || "Error al actualizar programación");
      }

      const result = await response.json();
      console.log("Update successful:", result);

      toast.success("Programación actualizada exitosamente");
      onSuccess?.();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar programación");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
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
            Actualizar Programación
          </Button>
        </div>
      </form>
    </Form>
  );
}
