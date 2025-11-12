import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Control } from "react-hook-form"
import { UserFormData } from "./user-form-schema"
import { ProfilePhotoUpload } from "@/components/forms/profile-photo-upload"

interface UserBasicFieldsProps {
  control: Control<UserFormData>
  mode: "create" | "invite" | "edit"
}

export function UserBasicFields({ control, mode }: UserBasicFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<UserFormData>
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<UserFormData>
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "create" && (
          <FormField<UserFormData>
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter password" {...field} value={field.value || ""}  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Profile Photo */}
      <FormField<UserFormData>
        control={control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ProfilePhotoUpload
                value={field.value}
                onChange={field.onChange}
                onRemove={() => field.onChange(null)}
                userName={control._formValues.name || "User"}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}