import { Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LocationFormData } from "@/schemas/location"

interface LocationWorkScheduleProps {
  control: Control<LocationFormData>
}

const TIMEZONES = [
  { value: "America/Costa_Rica", label: "Costa Rica (UTC-6)" },
  { value: "America/Mexico_City", label: "México Central (UTC-6)" },
  { value: "America/New_York", label: "Nueva York (UTC-5/UTC-4)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (UTC-8/UTC-7)" },
  { value: "America/Chicago", label: "Chicago (UTC-6/UTC-5)" },
  { value: "America/Bogota", label: "Colombia (UTC-5)" },
  { value: "America/Lima", label: "Perú (UTC-5)" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina (UTC-3)" },
  { value: "America/Santiago", label: "Chile (UTC-4/UTC-3)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1/UTC+2)" },
]

const WEEK_DAYS = [
  { value: "MON", label: "Lunes" },
  { value: "TUE", label: "Martes" },
  { value: "WED", label: "Miércoles" },
  { value: "THU", label: "Jueves" },
  { value: "FRI", label: "Viernes" },
  { value: "SAT", label: "Sábado" },
  { value: "SUN", label: "Domingo" },
]

export const LocationWorkSchedule = ({ control }: LocationWorkScheduleProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Horario de Trabajo</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Hora de entrada */}
          <FormField<LocationFormData>
            control={control}
            name="workStartTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de entrada *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={(field.value as string) ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Hora esperada de entrada</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hora de salida */}
          <FormField<LocationFormData>
            control={control}
            name="workEndTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de salida *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={(field.value as string) ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Hora esperada de salida</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tolerancia de retraso */}
        <FormField<LocationFormData>
          control={control}
          name="lateToleranceMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tolerancia de retraso (minutos) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  placeholder="15"
                  value={(field.value as number) ?? 15}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Minutos de gracia antes de marcar como tarde (0-60 minutos)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Timezone */}
        <FormField<LocationFormData>
          control={control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona horaria *</FormLabel>
              <Select
                value={(field.value as string) ?? ""}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar zona horaria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Zona horaria de esta ubicación para cálculo de horarios
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Días laborales */}
      <FormField<LocationFormData>
        control={control}
        name="workDays"
        render={({ field }) => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Días laborales *</FormLabel>
              <FormDescription>
                Selecciona los días de la semana en los que aplica este horario
              </FormDescription>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WEEK_DAYS.map((day) => {
                const workDaysArray = (field.value as ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[]) ?? []
                const dayValue = day.value as "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"
                return (
                  <FormItem
                    key={day.value}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={workDaysArray.includes(dayValue)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...workDaysArray, dayValue])
                          } else {
                            field.onChange(
                              workDaysArray.filter((value) => value !== dayValue)
                            )
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {day.label}
                    </FormLabel>
                  </FormItem>
                )
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
