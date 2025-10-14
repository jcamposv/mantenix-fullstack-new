import { Control, FieldPath, FieldValues } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface ColorField<T extends FieldValues> {
  name: FieldPath<T>
  label: string
  placeholder: string
}

interface ColorPickerFieldProps<T extends FieldValues> {
  control: Control<T>
  fields: ColorField<T>[]
  title?: string
  columns?: 1 | 2 | 3 | 4
}

export function ColorPickerField<T extends FieldValues>({ 
  control, 
  fields, 
  title = "Personalización de Colores",
  columns = 3 
}: ColorPickerFieldProps<T>) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2", 
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {fields.map((colorField) => (
          <FormField
            key={colorField.name}
            control={control}
            name={colorField.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{colorField.label}</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="color" 
                      {...field} 
                      className="w-12 h-10 flex-shrink-0" 
                    />
                    <Input 
                      {...field} 
                      placeholder={colorField.placeholder}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}