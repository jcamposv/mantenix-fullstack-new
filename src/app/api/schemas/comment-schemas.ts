import { z } from "zod"

// Schema para crear comentarios
export const createCommentSchema = z.object({
  content: z.string().min(1, "El contenido es requerido").max(2000, "El contenido es muy largo")
})

// Types derivados de los schemas
export type CreateCommentInput = z.infer<typeof createCommentSchema>