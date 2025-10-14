/**
 * Header component for authentication forms
 * Displays company logo or default SVG logo
 * Used in: Login, Invite, and other auth forms
 */

import { useState } from "react"

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
          <img 
            src="/images/mantenix-logo-black.svg" 
            alt="Mantenix logo"
            className="h-12 object-contain dark:invert"
          />
        ) : (
          <img 
            src={displayLogo} 
            alt={`${displayCompanyName} logo`}
            className="size-34 object-contain"
            onError={() => setImageError(true)}
          />
        )}
      </a>
    </div>
  )
}

