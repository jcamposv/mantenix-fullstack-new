"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useSignedUrl } from '@/hooks/use-signed-url'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageIcon } from 'lucide-react'

interface SignedImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function SignedImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
  sizes,
  priority,
  onLoad,
  onError,
}: SignedImageProps) {
  const { signedUrl, loading, error } = useSignedUrl(src)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
    onError?.()
  }

  const handleImageLoad = () => {
    setImageError(false)
    onLoad?.()
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Skeleton className={fill ? "w-full h-full" : `w-[${width}px] h-[${height}px]`} />
      </div>
    )
  }

  if (error || imageError || !signedUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
        <ImageIcon className="w-8 h-8" />
      </div>
    )
  }

  return (
    <Image
      src={signedUrl}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  )
}