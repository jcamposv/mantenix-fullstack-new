/**
 * Company branding image component
 * Displays company branding image on the side of auth forms
 * Used in: Login, Invite, and other auth forms
 */

import Image from "next/image"

interface CompanyBrandingImageProps {
  displayCompanyName: string
  logo?: string
}

export function CompanyBrandingImage({ displayCompanyName }: CompanyBrandingImageProps) {
  return (
    <div className="bg-muted relative hidden lg:block">
      <Image
        src={"/images/baner-1.jpg"}
        alt={`${displayCompanyName} branding`}
        fill
        className="object-cover dark:brightness-[0.2] dark:grayscale"
        priority
      />
    </div>
  )
}

