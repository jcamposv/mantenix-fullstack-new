/**
 * Header component for authentication forms
 * Displays company logo or default SVG logo
 * Used in: Login, Invite, and other auth forms
 */

import { useState } from "react"
import Image from "next/image"

interface AuthFormHeaderProps {
  displayLogo: string
  displayCompanyName: string
  hasCustomBranding?: boolean
}

export function AuthFormHeader({ displayLogo, displayCompanyName, hasCustomBranding = false }: AuthFormHeaderProps) {
  const [imageError, setImageError] = useState(false)
  
  // Use default logo if no custom branding or if image fails to load
  const shouldUseDefaultLogo = !hasCustomBranding || imageError

  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <a href="#" className="flex items-center gap-2 font-medium mb-4 m-auto">
        {shouldUseDefaultLogo ? (
          <Image 
            src="/images/mantenix-logo-black.svg" 
            alt="Mantenix logo"
            width={120}
            height={48}
            className="h-12 w-auto object-contain dark:invert"
          />
        ) : (
          <Image 
            src={displayLogo} 
            alt={`${displayCompanyName} logo`}
            width={136}
            height={136}
            className="size-34 object-contain"
            onError={() => setImageError(true)}
          />
        )}
      </a>
    </div>
  )
}

