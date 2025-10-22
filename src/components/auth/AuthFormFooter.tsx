/**
 * Footer component for authentication forms
 * Displays copyright, powered by Mantenix branding, and optional terms
 * Used in: Login, Invite, and other auth forms
 */

import Image from "next/image"

interface AuthFormFooterProps {
  showTerms?: boolean
}

export function AuthFormFooter({ showTerms = false }: AuthFormFooterProps) {
  return (
    <div className="mt-auto py-2 text-center text-xs text-muted-foreground border-t">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <a 
            href="https://mantenix.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Image 
              src="/images/mantenix-logo-black.svg" 
              alt="Mantenix" 
              width={80}
              height={16}
              className="h-4 w-auto dark:invert"
            />
          </a>
        </div>
        <div>
          © {new Date().getFullYear()} Mantenix. Todos los derechos reservados.
        </div>
        {showTerms && (
          <div className="text-xs">
            Al crear una cuenta, aceptas nuestros{" "}
            <a href="/terms" className="underline underline-offset-4">
              Términos de Servicio
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

