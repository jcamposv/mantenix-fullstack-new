"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/components/sidebar/sidebar-utils"
import { useProfilePhotoSignedUrl } from "@/hooks/use-profile-photo-signed-url"
import { Loader2 } from "lucide-react"

interface UserAvatarProps {
  name: string
  image?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZES = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10"
} as const

export function UserAvatar({ name, image, size = "md", className }: UserAvatarProps) {
  const { signedUrl, loading } = useProfilePhotoSignedUrl(image)

  return (
    <Avatar className={`${SIZES[size]} ${className || ""}`}>
      {loading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : signedUrl ? (
        <AvatarImage src={signedUrl} alt={name} />
      ) : null}
      <AvatarFallback>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}