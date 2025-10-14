import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/components/sidebar/sidebar-utils"

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
  return (
    <Avatar className={`${SIZES[size]} ${className || ""}`}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}