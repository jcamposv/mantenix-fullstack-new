/**
 * Digital Signature Repository
 * Data access layer for digital signatures (ISO compliance)
 */

import { PrismaClient, Prisma, SignatureEntityType, SignatureType } from '@prisma/client'
import type { DigitalSignatureWithRelations } from '@/types/digital-signature.types'
import type { SystemRoleKey } from '@/types/auth.types'

const prisma = new PrismaClient()

export class DigitalSignatureRepository {
  /**
   * Create a new digital signature
   */
  static async create(
    data: Prisma.DigitalSignatureCreateInput
  ): Promise<DigitalSignatureWithRelations> {
    const signature = await prisma.digitalSignature.create({
      data,
      include: {
        signer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true
              }
            }
          }
        }
      }
    })

    return {
      ...signature,
      signedAt: signature.signedAt.toISOString(),
      signer: signature.signer ? {
        id: signature.signer.id,
        name: signature.signer.name,
        email: signature.signer.email,
        role: signature.signer.role.key as SystemRoleKey
      } : undefined
    } as DigitalSignatureWithRelations
  }

  /**
   * Find signatures by entity
   */
  static async findByEntity(
    entityType: string,
    entityId: string
  ): Promise<DigitalSignatureWithRelations[]> {
    const signatures = await prisma.digitalSignature.findMany({
      where: {
        entityType: entityType as SignatureEntityType,
        entityId
      },
      include: {
        signer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true
              }
            }
          }
        }
      },
      orderBy: {
        signedAt: 'asc'
      }
    })

    return signatures.map(sig => ({
      ...sig,
      signedAt: sig.signedAt.toISOString(),
      signer: sig.signer ? {
        id: sig.signer.id,
        name: sig.signer.name,
        email: sig.signer.email,
        role: sig.signer.role.key as SystemRoleKey
      } : undefined
    })) as DigitalSignatureWithRelations[]
  }

  /**
   * Check if entity has specific signature type
   */
  static async hasSignature(
    entityType: string,
    entityId: string,
    signatureType: string
  ): Promise<boolean> {
    const count = await prisma.digitalSignature.count({
      where: {
        entityType: entityType as SignatureEntityType,
        entityId,
        signatureType: signatureType as SignatureType
      }
    })

    return count > 0
  }
}
