import { useState, useEffect } from 'react'

export function useInventoryImageSignedUrl(imageUrl: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      setSignedUrl(null)
      return
    }

    // If the URL is already a data URL or doesn't need signing, use it directly
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      setSignedUrl(imageUrl)
      return
    }

    // If it's not an S3 URL, use it directly
    if (!imageUrl.includes('s3.amazonaws.com') && !imageUrl.includes('.s3.')) {
      setSignedUrl(imageUrl)
      return
    }

    const fetchSignedUrl = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/inventory/images/signed-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        })

        if (!response.ok) {
          throw new Error('Failed to get signed URL')
        }

        const data = await response.json()
        setSignedUrl(data.signedUrl)
      } catch (err) {
        console.error('Error fetching signed URL:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setSignedUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSignedUrl()
  }, [imageUrl])

  return { signedUrl, loading, error }
}
