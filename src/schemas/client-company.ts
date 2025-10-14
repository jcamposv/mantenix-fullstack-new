import * as z from "zod"

export const clientCompanySchema = z.object({
  name: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  companyId: z.string().min(1, "La cédula jurídica es requerida"),
  logo: z.string().optional(),
  address: z.string().min(1, "La dirección es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Dirección de email inválida").min(1, "El email es requerido"),
  contactName: z.string().min(1, "El nombre del contacto es requerido"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  notes: z.string().optional(),
})

export type ClientCompanyFormData = z.infer<typeof clientCompanySchema>

// Output type with transformed coordinates
export interface ClientCompanySubmitData extends Omit<ClientCompanyFormData, 'latitude' | 'longitude'> {
  latitude?: number
  longitude?: number
}