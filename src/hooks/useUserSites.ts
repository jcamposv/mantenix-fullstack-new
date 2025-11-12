"use client"

import { useState, useEffect } from "react"
import { useCurrentUser } from "./useCurrentUser"

interface Site {
  id: string
  name: string
  address?: string
  clientCompany: {
    id: string
    name: string
  }
}

interface ApiSite {
  id: string
  name: string
  address?: string | null
  clientCompany: {
    id: string
    name: string
  }
}

interface UseUserSitesReturn {
  sites: Site[]
  loading: boolean
  error: string | null
  needsSiteSelection: boolean
  currentUserSiteId: string | null
}

export function useUserSites(): UseUserSitesReturn {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useCurrentUser()

  const needsSiteSelection = user?.role === "SUPER_ADMIN" || 
                            user?.role === "ADMIN_EMPRESA" || 
                            user?.role === "CLIENTE_ADMIN_GENERAL"

  const currentUserSiteId = user?.siteId || null

  useEffect(() => {
    async function fetchSites() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        if (needsSiteSelection) {
          // Para usuarios que necesitan seleccionar sede, usar el API de admin
          let endpoint = '/api/admin/sites'
          
          // Si es CLIENTE_ADMIN_GENERAL, necesitamos un endpoint específico
          if (user.role === "CLIENTE_ADMIN_GENERAL") {
            // Usar endpoint específico para cliente admin general
            endpoint = `/api/admin/client-companies/${user.clientCompanyId}/sites`
          }

          const response = await fetch(endpoint)
          
          if (response.ok) {
            const data = await response.json() as ApiSite[]
            setSites(data.map((site) => ({
              id: site.id,
              name: site.name,
              address: site.address || undefined,
              clientCompany: {
                id: site.clientCompany.id,
                name: site.clientCompany.name
              }
            })))
          } else {
            setError('Error al cargar las sedes disponibles')
          }
        } else {
          // Para usuarios con sede fija, no necesitan cargar lista de sedes
          setSites([])
        }
      } catch (err) {
        console.error('Error fetching sites:', err)
        setError('Error al cargar las sedes')
      } finally {
        setLoading(false)
      }
    }

    fetchSites()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, needsSiteSelection])

  return {
    sites,
    loading,
    error,
    needsSiteSelection,
    currentUserSiteId
  }
}