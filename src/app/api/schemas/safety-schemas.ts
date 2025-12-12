import { z } from "zod"
import {
  createWorkPermitSchema,
  updateWorkPermitSchema,
  authorizePermitSchema,
  closePermitSchema,
  permitTypeSchema,
  permitStatusSchema
} from "@/schemas/work-permit.schema"
import {
  createLOTOProcedureSchema,
  updateLOTOProcedureSchema,
  applyLOTOSchema,
  verifyLOTOSchema,
  removeLOTOSchema,
  lotoStatusSchema
} from "@/schemas/loto-procedure.schema"
import {
  createJobSafetyAnalysisSchema,
  updateJobSafetyAnalysisSchema,
  reviewJSASchema,
  approveJSASchema,
  rejectJSASchema,
  jsaStatusSchema
} from "@/schemas/job-safety-analysis.schema"

export {
  createWorkPermitSchema,
  updateWorkPermitSchema,
  authorizePermitSchema,
  closePermitSchema,
  permitTypeSchema,
  permitStatusSchema,
  createLOTOProcedureSchema,
  updateLOTOProcedureSchema,
  applyLOTOSchema,
  verifyLOTOSchema,
  removeLOTOSchema,
  lotoStatusSchema,
  createJobSafetyAnalysisSchema,
  updateJobSafetyAnalysisSchema,
  reviewJSASchema,
  approveJSASchema,
  rejectJSASchema,
  jsaStatusSchema
}

export const workPermitFiltersAPISchema = z.object({
  workOrderId: z.string().optional(),
  permitType: permitTypeSchema.optional(),
  status: permitStatusSchema.optional(),
  issuedBy: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export const lotoProcedureFiltersAPISchema = z.object({
  workOrderId: z.string().optional(),
  assetId: z.string().optional(),
  status: lotoStatusSchema.optional(),
  authorizedBy: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export const jsaFiltersAPISchema = z.object({
  workOrderId: z.string().optional(),
  status: jsaStatusSchema.optional(),
  preparedBy: z.string().optional(),
  reviewedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export type WorkPermitFiltersInput = z.infer<typeof workPermitFiltersAPISchema>
export type LOTOProcedureFiltersInput = z.infer<typeof lotoProcedureFiltersAPISchema>
export type JSAFiltersInput = z.infer<typeof jsaFiltersAPISchema>
