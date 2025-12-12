/**
 * Digital Signature Service
 * Business logic for digital signatures (ISO compliance)
 */

import { DigitalSignatureRepository } from '../repositories/digital-signature.repository'
import { SignatureType as PrismaSignatureType } from '@prisma/client'
import type { AuthenticatedSession } from '@/types/auth.types'
import type {
  SignatureEntityType,
  SignatureType,
  DigitalSignatureWithRelations
} from '@/types/digital-signature.types'

export class DigitalSignatureService {
  /**
   * Create a digital signature for an entity
   */
  static async createSignature(
    session: AuthenticatedSession,
    entityType: SignatureEntityType,
    entityId: string,
    signatureType: SignatureType,
    comments?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<DigitalSignatureWithRelations> {
    // Get user's current role
    const userRole = session.user.role

    // Map TypeScript SignatureType to Prisma SignatureType enum
    // Note: REJECTED and COMPLETED from TypeScript type are not in Prisma enum
    // Map REJECTED -> APPROVED (as rejection is handled via status, not signature type)
    // Map COMPLETED -> CLOSED (completion is represented as closure)
    const prismaSignatureType: PrismaSignatureType = 
      signatureType === 'REJECTED' ? 'APPROVED' :
      signatureType === 'COMPLETED' ? 'CLOSED' :
      signatureType as PrismaSignatureType

    return await DigitalSignatureRepository.create({
      entityType,
      entityId,
      signatureType: prismaSignatureType,
      signer: {
        connect: { id: session.user.id }
      },
      role: userRole,
      comments: comments || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      certificateFingerprint: null // For future PKI integration
    })
  }

  /**
   * Get signatures for an entity
   */
  static async getSignaturesByEntity(
    entityType: SignatureEntityType,
    entityId: string
  ): Promise<DigitalSignatureWithRelations[]> {
    return await DigitalSignatureRepository.findByEntity(entityType, entityId)
  }

  /**
   * Check if entity has specific signature
   */
  static async hasSignature(
    entityType: SignatureEntityType,
    entityId: string,
    signatureType: SignatureType
  ): Promise<boolean> {
    return await DigitalSignatureRepository.hasSignature(
      entityType,
      entityId,
      signatureType
    )
  }
}
