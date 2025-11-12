"use client"

import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInventoryImageSignedUrl } from "@/hooks/use-inventory-image-signed-url"
import Image from "next/image"

interface InventoryImagePreviewProps {
  imageUrl: string
  onRemove: () => void
}

export function InventoryImagePreview({ imageUrl, onRemove }: InventoryImagePreviewProps) {
  const { signedUrl, loading } = useInventoryImageSignedUrl(imageUrl)

  return (
    <div className="relative group aspect-square border rounded-lg overflow-hidden bg-muted">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : signedUrl ? (
        <>
          <Image
            src={signedUrl}
            alt="Inventory item"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Error
        </div>
      )}
    </div>
  )
}
