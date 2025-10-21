import { useState, useEffect } from 'react'

export function useWorkOrderMediaSignedUrl(mediaUrl: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mediaUrl) {
      setSignedUrl(null)
      return
    }

    // If the URL is already a data URL or blob URL, use it directly
    if (mediaUrl.startsWith('data:') || mediaUrl.startsWith('blob:')) {
      setSignedUrl(mediaUrl)
      return
    }

    // If it's not an S3 URL from work order media bucket, use it directly
    if (!mediaUrl.includes('s3.amazonaws.com') && !mediaUrl.includes('.s3.')) {
      setSignedUrl(mediaUrl)
      return
    }

    // Check if it's from the work order media bucket
    const workOrderBucket = process.env.NEXT_PUBLIC_AWS_WORK_ORDER_MEDIA_BUCKET || "mantenix-work-order-media-dev"
    if (!mediaUrl.includes(workOrderBucket)) {
      setSignedUrl(mediaUrl)
      return
    }

    const fetchSignedUrl = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/work-orders/media/signed-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mediaUrl }),
        })

        if (!response.ok) {
          throw new Error('Failed to get signed URL for work order media')
        }

        const data = await response.json()
        setSignedUrl(data.signedUrl)
      } catch (err) {
        console.error('Error fetching work order media signed URL:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setSignedUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSignedUrl()
  }, [mediaUrl])

  return { signedUrl, loading, error }
}