import { z } from "zod"
import {
  createAuthorityLimitSchema,
  updateAuthorityLimitSchema
} from "@/schemas/authority-limit.schema"
import {
  createApprovalRuleSchema,
  updateApprovalRuleSchema,
  workOrderPrioritySchema,
  workOrderTypeSchema
} from "@/schemas/approval-rule.schema"
import {
  createWorkOrderApprovalSchema,
  updateWorkOrderApprovalSchema,
  approveWorkOrderSchema,
  rejectWorkOrderSchema,
  approvalStatusSchema
} from "@/schemas/work-order-approval.schema"

export {
  createAuthorityLimitSchema,
  updateAuthorityLimitSchema,
  createApprovalRuleSchema,
  updateApprovalRuleSchema,
  workOrderPrioritySchema,
  workOrderTypeSchema,
  createWorkOrderApprovalSchema,
  updateWorkOrderApprovalSchema,
  approveWorkOrderSchema,
  rejectWorkOrderSchema,
  approvalStatusSchema
}

export const authorityLimitFiltersAPISchema = z.object({
  search: z.string().optional(),
  roleKey: z.string().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export const approvalRuleFiltersAPISchema = z.object({
  search: z.string().optional(),
  priority: workOrderPrioritySchema.optional(),
  type: workOrderTypeSchema.optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export const workOrderApprovalFiltersAPISchema = z.object({
  workOrderId: z.string().optional(),
  approverId: z.string().optional(),
  status: approvalStatusSchema.optional(),
  level: z.coerce.number().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export type AuthorityLimitFiltersInput = z.infer<typeof authorityLimitFiltersAPISchema>
export type ApprovalRuleFiltersInput = z.infer<typeof approvalRuleFiltersAPISchema>
export type WorkOrderApprovalFiltersInput = z.infer<typeof workOrderApprovalFiltersAPISchema>
