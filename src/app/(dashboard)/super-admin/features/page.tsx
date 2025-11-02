"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Building2, CheckCircle2, XCircle } from "lucide-react"
import { AVAILABLE_FEATURES } from "@/types/attendance.types"
import type { FeatureModule } from "@prisma/client"

interface Company {
  id: string
  name: string
  subdomain: string
  tier: string
  isActive: boolean
}

interface CompanyFeature {
  id: string
  module: FeatureModule
  isEnabled: boolean
  enabledAt: string
  enabledBy?: string
}

interface CompanyWithFeatures extends Company {
  features: CompanyFeature[]
}

export default function SuperAdminFeaturesPage() {
  const [companies, setCompanies] = useState<CompanyWithFeatures[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchCompanies = async () => {
    try {
      // Obtener todas las empresas
      const companiesRes = await fetch("/api/admin/companies?limit=100")

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()

        // Obtener features para cada empresa
        const companiesWithFeatures = await Promise.all(
          companiesData.companies.map(async (company: Company) => {
            try {
              const featuresRes = await fetch(`/api/admin/features/${company.id}`)

              if (featuresRes.ok) {
                const features = await featuresRes.json()
                return { ...company, features }
              }
            } catch (error) {
              console.error(`Error fetching features for ${company.name}:`, error)
            }
            return { ...company, features: [] }
          })
        )

        setCompanies(companiesWithFeatures)
      } else {
        toast.error("Error al cargar empresas")
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast.error("Error al cargar empresas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleToggleFeature = async (
    companyId: string,
    module: FeatureModule,
    currentValue: boolean
  ) => {
    const toggleKey = `${companyId}-${module}`
    setToggling(toggleKey)

    try {
      const response = await fetch("/api/admin/features/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          companyId,
          module,
          isEnabled: !currentValue
        })
      })

      if (response.ok) {
        toast.success(
          `Feature ${!currentValue ? "habilitado" : "deshabilitado"} exitosamente`
        )

        // Actualizar el estado local
        setCompanies((prev) =>
          prev.map((company) => {
            if (company.id !== companyId) return company

            const existingFeature = company.features.find((f) => f.module === module)

            if (existingFeature) {
              return {
                ...company,
                features: company.features.map((f) =>
                  f.module === module ? { ...f, isEnabled: !currentValue } : f
                )
              }
            } else {
              return {
                ...company,
                features: [
                  ...company.features,
                  {
                    id: `new-${Date.now()}`,
                    module,
                    isEnabled: !currentValue,
                    enabledAt: new Date().toISOString()
                  }
                ]
              }
            }
          })
        )
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al actualizar feature")
      }
    } catch (error) {
      console.error("Error toggling feature:", error)
      toast.error("Error al actualizar feature")
    } finally {
      setToggling(null)
    }
  }

  const isFeatureEnabled = (company: CompanyWithFeatures, module: FeatureModule): boolean => {
    const feature = company.features.find((f) => f.module === module)
    return feature?.isEnabled ?? false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestión de Features Premium</h1>
        <p className="text-muted-foreground mt-2">
          Habilita o deshabilita módulos premium para cada empresa
        </p>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Módulos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(AVAILABLE_FEATURES).map((feature) => (
              <div key={feature.module} className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge variant="outline" className="mt-0.5">
                  {feature.category}
                </Badge>
                <div>
                  <p className="font-medium text-sm">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Companies */}
      <div className="space-y-4">
        {companies.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay empresas registradas
            </CardContent>
          </Card>
        )}

        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    <CardDescription>
                      {company.subdomain}.localhost • Plan: {company.tier}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.values(AVAILABLE_FEATURES).map((feature) => {
                  const isEnabled = isFeatureEnabled(company, feature.module as FeatureModule)
                  const toggleKey = `${company.id}-${feature.module}`
                  const isTogglingThis = toggling === toggleKey

                  return (
                    <div
                      key={feature.module}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {isEnabled ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{feature.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() =>
                          handleToggleFeature(
                            company.id,
                            feature.module as FeatureModule,
                            isEnabled
                          )
                        }
                        disabled={isTogglingThis}
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
