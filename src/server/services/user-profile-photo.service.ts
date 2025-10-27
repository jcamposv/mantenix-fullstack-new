import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { UserRepository } from "@/server/repositories/user.repository"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { UserWithRelations } from "@/types/user.types"

/**
 * Service para manejar las fotos de perfil de usuarios
 */
export class UserProfilePhotoService {
  private static s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  private static readonly BUCKET_NAME = process.env.AWS_PROFILE_BUCKET || "mantenix-profiles"
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  /**
   * Sube una foto de perfil a S3 y actualiza el usuario
   */
  static async uploadProfilePhoto(
    session: AuthenticatedSession,
    file: File
  ): Promise<{ user: UserWithRelations; url: string }> {
    // Validar tamaño del archivo
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error("El tamaño del archivo excede el límite de 5MB")
    }

    // Validar tipo de archivo
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedImageTypes.includes(file.type)) {
      throw new Error("Tipo de archivo inválido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)")
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${extension}`

    // Estructura: {companyId}/{userId}/{fileName}
    const companyId = session.user.companyId || 'unknown'
    const key = `${companyId}/${session.user.id}/${fileName}`

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a S3
    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        userId: session.user.id,
        uploadedAt: new Date().toISOString()
      }
    })

    await this.s3Client.send(command)

    // Guardar la referencia en la base de datos
    const updatedUser = await UserRepository.updateProfilePhoto(session.user.id, key)

    return {
      user: updatedUser,
      url: key
    }
  }

  /**
   * Sube una foto a S3 SIN actualizar la base de datos
   * Útil para formularios de creación/edición de usuarios por admins
   */
  static async uploadToS3Only(
    session: AuthenticatedSession,
    file: File
  ): Promise<{ url: string }> {
    // Validar tamaño del archivo
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error("El tamaño del archivo excede el límite de 5MB")
    }

    // Validar tipo de archivo
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedImageTypes.includes(file.type)) {
      throw new Error("Tipo de archivo inválido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)")
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${extension}`

    // Estructura: {companyId}/pending/{fileName}
    // Usamos 'pending' para fotos que aún no están asociadas a un usuario específico
    const companyId = session.user.companyId || 'unknown'
    const key = `${companyId}/pending/${fileName}`

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a S3
    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString()
      }
    })

    await this.s3Client.send(command)

    return {
      url: key
    }
  }

  /**
   * Obtiene la URL de la foto de perfil del usuario
   * @param userImageKey La key de la imagen almacenada en el campo image del usuario
   * @returns La URL completa para acceder a la imagen
   */
  static getProfilePhotoUrl(userImageKey: string | null): string | null {
    if (!userImageKey) return null

    // Si ya es una URL completa, retornarla
    if (userImageKey.startsWith('http')) {
      return userImageKey
    }

    // Construir URL de S3
    return `https://${this.BUCKET_NAME}.s3.amazonaws.com/${userImageKey}`
  }
}
