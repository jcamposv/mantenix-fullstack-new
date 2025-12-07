"use client"

import useSWR from "swr"

/**
 * Hook para obtener URLs firmadas de fotos de perfil almacenadas en S3
 * Optimizado con SWR para caché de larga duración (50 min) ya que las URLs expiran en 1 hora
 *
 * @param imageKey - La clave de la imagen en S3 (guardada en user.image)
 * @returns objeto con la URL firmada, estado de carga y error
 */

const fetcher = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch signed URL')
  }
  const data = await response.json()
  return data.url
}

export function useProfilePhotoSignedUrl(imageKey: string | null | undefined) {
  // Si no hay imageKey, retornar null inmediatamente
  const needsSigning = imageKey && !imageKey.startsWith('http')

  const { data, error, isLoading } = useSWR<string>(
    needsSigning ? `/api/user/profile-photo/signed-url?key=${encodeURIComponent(imageKey)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute - evita requests duplicados
      // S3 signed URLs expire in 1 hour, cache for 50 minutes to be safe
      focusThrottleInterval: 3000000, // 50 minutes
      onError: (err) => {
        console.error('Error fetching profile photo signed URL:', err)
      }
    }
  )

  // Si imageKey ya es una URL completa, usarla directamente
  const signedUrl = imageKey?.startsWith('http') ? imageKey : (data || null)
  const loading = needsSigning ? isLoading : false

  return {
    signedUrl,
    loading,
    error: error?.message || null
  }
}
