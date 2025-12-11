import { useMemo } from 'react'
import useSWR from 'swr'

interface SignedUrlResponse {
  signedUrl: string
}

// Fetcher for POST requests to get signed URLs
const signedUrlFetcher = async (url: string, imageUrl: string): Promise<SignedUrlResponse> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  })

  if (!response.ok) {
    throw new Error('Failed to get signed URL')
  }

  return response.json()
}

export function useSignedUrl(imageUrl: string | null | undefined) {
  // Check if URL needs signing
  const needsSigning = useMemo(() => {
    if (!imageUrl) return false

    // If the URL is already a data URL or doesn't need signing, skip
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) return false

    // Only sign S3 URLs
    return imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('.s3.')
  }, [imageUrl])

  // Create cache key - only for URLs that need signing
  const cacheKey = needsSigning && imageUrl ? ['signed-url', imageUrl] : null

  // Use SWR with intelligent caching for signed URLs
  const { data, error: swrError, isLoading } = useSWR<SignedUrlResponse>(
    cacheKey,
    () => signedUrlFetcher('/api/assets/images/signed-url', imageUrl!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
      // S3 signed URLs typically expire in 1 hour, so we cache for 50 minutes
      // to be safe and revalidate before expiration
      focusThrottleInterval: 3000000, // 50 minutes in milliseconds
      errorRetryCount: 2,
      shouldRetryOnError: true,
      onError: (err) => {
        console.error('Error fetching signed URL:', err)
      }
    }
  )

  // Return appropriate URL based on type
  const signedUrl = useMemo(() => {
    if (!imageUrl) return null

    // Return data URLs and blob URLs directly
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl
    }

    // Return non-S3 URLs directly
    if (!needsSigning) {
      return imageUrl
    }

    // Return signed URL from SWR cache
    return data?.signedUrl ?? null
  }, [imageUrl, needsSigning, data])

  const error = swrError?.message ?? null

  return {
    signedUrl,
    loading: isLoading,
    error
  }
}