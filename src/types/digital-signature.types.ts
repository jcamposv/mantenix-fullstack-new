/**
 * Digital Signature Types
 * Types for digital signatures (ISO compliance)
 */

import type { PaginatedResponse } from "./common.types"
import type { SystemRoleKey } from "./auth.types"

export type SignatureEntityType =
  | "WORK_ORDER"
  | "WORK_ORDER_APPROVAL"
  | "WORK_PERMIT"
  | "LOTO_PROCEDURE"
  | "JSA"
  | "RCA"
  | "CAP_ACTION"
  | "QA_INSPECTION"

export type SignatureType =
  | "CREATED"
  | "APPROVED"
  | "REJECTED"
  | "AUTHORIZED"
  | "EXECUTED"
  | "VERIFIED"
  | "QA_SIGNOFF"
  | "COMPLETED"
  | "CLOSED"

export interface DigitalSignature {
  id: string
  entityType: SignatureEntityType
  entityId: string
  signedBy: string
  role: string
  signatureType: SignatureType
  comments: string | null
  ipAddress: string | null
  userAgent: string | null
  certificateFingerprint: string | null
  signedAt: string
}

export interface DigitalSignatureWithRelations extends DigitalSignature {
  signer?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  }
}

export interface CreateDigitalSignatureData {
  entityType: SignatureEntityType
  entityId: string
  signatureType: SignatureType
  comments?: string
  ipAddress?: string
  userAgent?: string
  certificateFingerprint?: string
}

export interface DigitalSignatureFilters {
  entityType?: SignatureEntityType
  entityId?: string
  signedBy?: string
  signatureType?: SignatureType
  signedAtFrom?: Date
  signedAtTo?: Date
}

export type PaginatedDigitalSignaturesResponse = PaginatedResponse<DigitalSignatureWithRelations>
