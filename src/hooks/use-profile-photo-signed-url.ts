"use client"

import { useState, useEffect } from "react"

/**
 * Hook para obtener URLs firmadas de fotos de perfil almacenadas en S3
 * @param imageKey - La clave de la imagen en S3 (guardada en user.image)
 * @returns objeto con la URL firmada, estado de carga y error
 */
export function useProfilePhotoSignedUrl(imageKey: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imageKey) {
      setSignedUrl(null)
      setLoading(false)
      return
    }

    // Si ya es una URL completa (http/https), usarla directamente
    if (imageKey.startsWith('http')) {
      setSignedUrl(imageKey)
      setLoading(false)
      return
    }

    const fetchSignedUrl = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/user/profile-photo/signed-url?key=${encodeURIComponent(imageKey)}`)

        if (!response.ok) {
          throw new Error('Failed to fetch signed URL')
        }

        const data = await response.json()
        setSignedUrl(data.url)
      } catch (err) {
        console.error('Error fetching signed URL:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setSignedUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSignedUrl()
  }, [imageKey])

  return { signedUrl, loading, error }
}
