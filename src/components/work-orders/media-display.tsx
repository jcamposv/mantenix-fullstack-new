"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageIcon, VideoIcon, Play, ExternalLink, Loader2 } from "lucide-react"
import { useWorkOrderMediaSignedUrl } from "@/hooks/use-work-order-media-signed-url"

interface MediaDisplayProps {
  url: string
  isVideo: boolean
  fieldLabel: string
}

export function MediaDisplay({ url, isVideo, fieldLabel }: MediaDisplayProps) {
  const { signedUrl, loading, error } = useWorkOrderMediaSignedUrl(url)
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className="relative w-20 h-20 rounded-lg border border-border bg-muted flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !signedUrl) {
    return (
      <div className="relative w-20 h-20 rounded-lg border border-border bg-muted flex flex-col items-center justify-center">
        {isVideo ? (
          <VideoIcon className="h-6 w-6 text-muted-foreground mb-1" />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
        )}
        <span className="text-xs text-muted-foreground text-center px-1">Error</span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative w-20 h-20 cursor-pointer group rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
          {isVideo ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                src={signedUrl}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Play className="h-6 w-6 text-white drop-shadow-lg" fill="white" />
              </div>
            </div>
          ) : (
            <Image
              src={signedUrl}
              alt={fieldLabel}
              quality={75}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="80px"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end">
            <div className="w-full bg-gradient-to-t from-black/50 to-transparent p-1">
              <ExternalLink className="h-3 w-3 text-white ml-auto" />
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{fieldLabel}</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-center p-4">
          {isVideo ? (
            <video
              src={signedUrl}
              controls
              className="max-w-full max-h-[70vh] rounded-lg"
              style={{ maxHeight: '70vh' }}
            />
          ) : (
            <div className="relative max-w-full max-h-[70vh]">
              <Image
                src={signedUrl}
                alt={fieldLabel}
                width={800}
                height={600}
                className="object-contain rounded-lg"
                style={{ maxHeight: '70vh', width: 'auto', height: 'auto' }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}