"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Loader2,
  Building2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  Settings,
  Activity
} from "lucide-react"
import { AIConfigForm } from "@/components/forms/ai-config/ai-config-form"
import type { AIConfigSubmitData } from "@/schemas/ai-config"
import { CompanySelector } from "@/components/admin/company-selector"

interface Company {
  id: string
  name: string
  subdomain: string
  tier: string
  isActive: boolean
  aiConfig: {
    id: string
    monthlyTokenLimit: number
    alertThresholdPercent: number
    currentMonthTokens: number
    insightsEnabled: boolean
    reportsEnabled: boolean
    predictiveEnabled: boolean
  } | null
  monthlyStats: {
    totalCalls: number
    totalTokens: number
    totalCost: number
    successfulCalls: number
    failedCalls: number
  } | null
}

export default function AIConfigurationPage() {
  const searchParams = useSearchParams()
  const companyIdFromUrl = searchParams.get('companyId')

  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companyIdFromUrl)
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState<string | null>(null)

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/ai-config")

      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies)

        // Auto-select first company or company from URL
        if (data.companies.length > 0) {
          if (companyIdFromUrl) {
            const urlCompany = data.companies.find((c: Company) => c.id === companyIdFromUrl)
            if (urlCompany) {
              setSelectedCompanyId(companyIdFromUrl)
            } else {
              setSelectedCompanyId(data.companies[0].id)
            }
          } else if (!selectedCompanyId) {
            setSelectedCompanyId(data.companies[0].id)
          }
        }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openConfigDialog = (company: Company) => {
    setSelectedCompany(company)
    setConfigDialogOpen(true)
  }

  const handleSubmit = async (data: AIConfigSubmitData) => {
    if (!selectedCompany) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/ai-config/${selectedCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success("Configuración actualizada exitosamente")
        setConfigDialogOpen(false)
        fetchCompanies()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al actualizar configuración")
      }
    } catch (error) {
      console.error("Error saving config:", error)
      toast.error("Error al actualizar configuración")
    } finally {
      setSaving(false)
    }
  }

  const handleResetTokens = async (companyId: string) => {
    if (!confirm("¿Estás seguro de resetear el contador de tokens?")) return

    setResetting(companyId)
    try {
      const response = await fetch(`/api/admin/ai-config/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetTokens: true })
      })

      if (response.ok) {
        toast.success("Tokens reseteados exitosamente")
        fetchCompanies()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al resetear tokens")
      }
    } catch (error) {
      console.error("Error resetting tokens:", error)
      toast.error("Error al resetear tokens")
    } finally {
      setResetting(null)
    }
  }

  const getUsagePercentage = (company: Company): number => {
    if (!company.aiConfig) return 0
    const { currentMonthTokens, monthlyTokenLimit } = company.aiConfig
    return monthlyTokenLimit > 0 ? (currentMonthTokens / monthlyTokenLimit) * 100 : 0
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 100) return "text-destructive"
    if (percentage >= 80) return "text-warning"
    return "text-success"
  }

  const displayedCompany = companies.find(c => c.id === selectedCompanyId)

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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Configuración de AI
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona límites de tokens y funcionalidades de IA por empresa
        </p>
      </div>

      {/* Company Selector */}
      <CompanySelector
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onCompanyChange={setSelectedCompanyId}
      />

      {/* Company Configuration */}
      {!displayedCompany ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {companies.length === 0 ? 'No hay empresas registradas' : 'Selecciona una empresa para configurar AI'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(() => {
            const company = displayedCompany
            const usagePercent = getUsagePercentage(company)
            const usageColor = getUsageColor(usagePercent)

            return (
              <Card className="shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-xl">{company.name}</CardTitle>
                        <CardDescription>
                          {company.subdomain}.localhost • {company.tier}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfigDialog(company)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {company.aiConfig ? (
                  <div className="space-y-4">
                    {/* Usage Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Uso de Tokens</span>
                        <span className={`text-sm font-bold ${usageColor}`}>
                          {usagePercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            usagePercent >= 100
                              ? "bg-destructive"
                              : usagePercent >= 80
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {company.aiConfig.currentMonthTokens.toLocaleString()} /{" "}
                          {company.aiConfig.monthlyTokenLimit.toLocaleString()} tokens
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetTokens(company.id)}
                          disabled={resetting === company.id}
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${resetting === company.id ? 'animate-spin' : ''}`} />
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    {company.monthlyStats && (
                      <div className="grid grid-cols-4 gap-3 pt-3 border-t">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Activity className="w-3 h-3" />
                            Llamadas
                          </div>
                          <p className="text-lg font-semibold">
                            {company.monthlyStats.totalCalls}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <TrendingUp className="w-3 h-3" />
                            Exitosas
                          </div>
                          <p className="text-lg font-semibold text-success">
                            {company.monthlyStats.successfulCalls}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <AlertTriangle className="w-3 h-3" />
                            Fallidas
                          </div>
                          <p className="text-lg font-semibold text-destructive">
                            {company.monthlyStats.failedCalls}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <DollarSign className="w-3 h-3" />
                            Costo
                          </div>
                          <p className="text-lg font-semibold text-primary">
                            ${company.monthlyStats.totalCost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Badge variant={company.aiConfig.insightsEnabled ? "default" : "secondary"}>
                        Insights {company.aiConfig.insightsEnabled ? "✓" : "✗"}
                      </Badge>
                      <Badge variant={company.aiConfig.reportsEnabled ? "default" : "secondary"}>
                        Reports {company.aiConfig.reportsEnabled ? "✓" : "✗"}
                      </Badge>
                      <Badge
                        variant={company.aiConfig.predictiveEnabled ? "default" : "secondary"}
                      >
                        Predictive {company.aiConfig.predictiveEnabled ? "✓" : "✗"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-3">
                      AI no configurado para esta empresa
                    </p>
                    <Button variant="outline" size="sm" onClick={() => openConfigDialog(company)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar Ahora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })()}
        </div>
      )}

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar AI - {selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              Ajusta los límites y funcionalidades de IA para esta empresa
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <AIConfigForm
              onSubmit={handleSubmit}
              onCancel={() => setConfigDialogOpen(false)}
              loading={saving}
              initialData={selectedCompany.aiConfig || undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
