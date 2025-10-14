/**
 * Company branding image component
 * Displays company branding image on the side of auth forms
 * Used in: Login, Invite, and other auth forms
 */

interface CompanyBrandingImageProps {
  displayCompanyName: string
}

export function CompanyBrandingImage({ displayCompanyName }: CompanyBrandingImageProps) {
  return (
    <div className="bg-muted relative hidden lg:block">
      <img
        src="/images/baner-1.jpg"
        alt={`${displayCompanyName} branding`}
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        onError={(e) => {
          e.currentTarget.src = "/images/logo-1.jpg"
        }}
      />
    </div>
  )
}

