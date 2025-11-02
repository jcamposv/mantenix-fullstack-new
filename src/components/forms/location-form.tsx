"use client"

import { useForm, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { locationSchema, type LocationFormData } from "@/schemas/location"
import { LocationBasicInfo } from "./location/location-basic-info"
import { LocationCoordinates } from "./location/location-coordinates"
import { LocationWorkSchedule } from "./location/location-work-schedule"
import { LocationSettings } from "./location/location-settings"

type LocationFormInput = z.input<typeof locationSchema>

interface LocationFormProps {
  onSubmit: (data: LocationFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<LocationFormData>
}

export const LocationForm = ({ onSubmit, onCancel, loading, initialData }: LocationFormProps) => {
  const defaultValues: LocationFormInput = {
    name: initialData?.name ?? "",
    address: initialData?.address,
    latitude: initialData?.latitude ?? 0,
    longitude: initialData?.longitude ?? 0,
    radiusMeters: initialData?.radiusMeters ?? 100,
    workStartTime: initialData?.workStartTime ?? "08:00",
    workEndTime: initialData?.workEndTime ?? "17:00",
    lateToleranceMinutes: initialData?.lateToleranceMinutes ?? 15,
    timezone: initialData?.timezone ?? "America/Costa_Rica",
    workDays: initialData?.workDays ?? ["MON", "TUE", "WED", "THU", "FRI"],
    isActive: initialData?.isActive ?? true,
  }

  const form = useForm<LocationFormInput>({
    resolver: zodResolver(locationSchema),
    defaultValues,
  })

  const handleSubmit = (data: LocationFormInput) => {
    // Parse the input data through the schema to get the output type
    const parsedData = locationSchema.parse(data)
    onSubmit(parsedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <LocationBasicInfo control={form.control as Control<LocationFormData>} />

        <LocationCoordinates control={form.control as Control<LocationFormData>} setValue={form.setValue} />

        <LocationWorkSchedule control={form.control as Control<LocationFormData>} />

        <LocationSettings control={form.control as Control<LocationFormData>} />

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? "Actualizar Ubicación" : "Crear Ubicación"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
