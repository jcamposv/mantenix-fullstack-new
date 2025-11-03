"use client"

import { useEffect } from "react"
import { useBranding } from "@/lib/auth-client"

/**
 * PWA Branding Updater Component
 *
 * Updates PWA meta tags dynamically based on company branding
 * This ensures the installed PWA reflects the correct branding
 */
export function PWABrandingUpdater() {
  const { branding } = useBranding()

  useEffect(() => {
    if (!branding) return

    // Update theme-color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta")
      themeColorMeta.setAttribute("name", "theme-color")
      document.head.appendChild(themeColorMeta)
    }
    if (branding.primaryColor) {
      themeColorMeta.setAttribute("content", branding.primaryColor)
    }

    // Update apple-mobile-web-app-title
    if (branding.name) {
      let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]')
      if (!appleTitleMeta) {
        appleTitleMeta = document.createElement("meta")
        appleTitleMeta.setAttribute("name", "apple-mobile-web-app-title")
        document.head.appendChild(appleTitleMeta)
      }
      appleTitleMeta.setAttribute("content", branding.name)
    }

    // Update apple-touch-icon
    if (branding.logo) {
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]')
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement("link")
        appleTouchIcon.setAttribute("rel", "apple-touch-icon")
        document.head.appendChild(appleTouchIcon)
      }
      appleTouchIcon.setAttribute("href", branding.logo)
    }

    // Update document title
    if (branding.name) {
      document.title = `${branding.name} - Sistema de Gestión`
    }

    // Update manifest link (force reload)
    const manifestLink = document.querySelector('link[rel="manifest"]')
    if (manifestLink) {
      const manifestHref = manifestLink.getAttribute("href") || "/api/manifest"
      // Add timestamp to force reload
      manifestLink.setAttribute("href", `${manifestHref.split('?')[0]}?t=${Date.now()}`)
    }

  }, [branding])

  return null // This component doesn't render anything
}
