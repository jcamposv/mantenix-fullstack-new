/**
 * Attachment Types
 * Types for file attachments (photos, PDFs, documents)
 */

import type { PaginatedResponse } from "./common.types"
import type { SignatureEntityType } from "./digital-signature.types"

export type AttachmentType =
  | "PHOTO"
  | "PDF"
  | "DOCUMENT"
  | "SPREADSHEET"
  | "VIDEO"
  | "AUDIO"
  | "OTHER"

export interface Attachment {
  id: string
  entityType: SignatureEntityType
  entityId: string
  fileName: string
  fileSize: number
  mimeType: string
  attachmentType: AttachmentType
  fileUrl: string
  description: string | null
  uploadedBy: string
  uploadedAt: string
}

export interface AttachmentWithRelations extends Attachment {
  uploader?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateAttachmentData {
  entityType: SignatureEntityType
  entityId: string
  fileName: string
  fileSize: number
  mimeType: string
  attachmentType: AttachmentType
  fileUrl: string
  description?: string
}

export interface UpdateAttachmentData {
  description?: string | null
}

export interface AttachmentFilters {
  entityType?: SignatureEntityType
  entityId?: string
  attachmentType?: AttachmentType
  uploadedBy?: string
  uploadedAtFrom?: Date
  uploadedAtTo?: Date
}

export type PaginatedAttachmentsResponse = PaginatedResponse<AttachmentWithRelations>
