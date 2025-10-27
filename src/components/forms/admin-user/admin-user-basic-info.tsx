import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { AdminUserFormData } from "@/schemas/admin-user"
import { ProfilePhotoUpload } from "@/components/forms/profile-photo-upload"

interface AdminUserBasicInfoProps {
  control: Control<AdminUserFormData>
  mode: "create" | "invite"
  currentUserCompanyName?: string
}

export function AdminUserBasicInfo({ control, mode, currentUserCompanyName }: AdminUserBasicInfoProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="juan@ejemplo.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Password - only show when creating users directly */}
      {mode === "create" && (
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormDescription>
                Mínimo 8 caracteres
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Profile Photo */}
      <FormField
        control={control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ProfilePhotoUpload
                value={field.value}
                onChange={field.onChange}
                onRemove={() => field.onChange(null)}
                userName={control._formValues.name || "Usuario"}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Invitation Info */}
      {mode === "invite" && (
        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Proceso de Invitación</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Se enviará una invitación por email a este usuario. Recibirá un enlace seguro para configurar su cuenta y contraseña.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Creando usuario para: {currentUserCompanyName}
      </p>
    </>
  )
}