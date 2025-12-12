import { z } from "zod"
import {
  createRootCauseAnalysisSchema,
  updateRootCauseAnalysisSchema,
  reviewRCASchema,
  approveRCASchema,
  rcaTypeSchema,
  rcaStatusSchema
} from "@/schemas/root-cause-analysis.schema"
import {
  createCAPActionSchema,
  updateCAPActionSchema,
  completeCAPActionSchema,
  verifyCAPActionSchema,
  actionTypeSchema,
  capStatusSchema
} from "@/schemas/cap-action.schema"
import { workOrderPrioritySchema } from "@/schemas/approval-rule.schema"

export {
  createRootCauseAnalysisSchema,
  updateRootCauseAnalysisSchema,
  reviewRCASchema,
  approveRCASchema,
  rcaTypeSchema,
  rcaStatusSchema,
  createCAPActionSchema,
  updateCAPActionSchema,
  completeCAPActionSchema,
  verifyCAPActionSchema,
  actionTypeSchema,
  capStatusSchema,
  workOrderPrioritySchema
}

export const rcaFiltersAPISchema = z.object({
  search: z.string().optional(),
  workOrderId: z.string().optional(),
  assetId: z.string().optional(),
  analysisType: rcaTypeSchema.optional(),
  status: rcaStatusSchema.optional(),
  analyzedBy: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export const capActionFiltersAPISchema = z.object({
  search: z.string().optional(),
  rcaId: z.string().optional(),
  actionType: actionTypeSchema.optional(),
  status: capStatusSchema.optional(),
  assignedTo: z.string().optional(),
  priority: workOrderPrioritySchema.optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export type RCAFiltersInput = z.infer<typeof rcaFiltersAPISchema>
export type CAPActionFiltersInput = z.infer<typeof capActionFiltersAPISchema>
