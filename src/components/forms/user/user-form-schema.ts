import * as z from "zod"

export const createUserSchema = (mode: "create" | "invite" | "edit") => z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: mode === "create" 
    ? z.string().min(8, "Password must be at least 8 characters")
    : z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN_EMPRESA", "SUPERVISOR", "TECNICO", "CLIENTE_ADMIN", "CLIENTE_OPERATIVO"]),
  companyId: z.string().optional(),
  timezone: z.string(),
  locale: z.string(),
})

export type UserFormData = z.infer<ReturnType<typeof createUserSchema>>

export interface Company {
  id: string
  name: string
  subdomain: string
}