"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Monitor, 
  Smartphone, 
  Settings, 
  ClipboardList,
  ArrowRight,
  Users,
  BarChart3
} from "lucide-react"

export default function PlatformSelectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePlatformSelection = async (platform: 'admin' | 'mobile') => {
    setLoading(platform)
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (platform === 'admin') {
      router.push('/')
    } else {
      // Navigate to mobile version (field app)
      router.push('/mobile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Selecciona tu Plataforma
          </h1>
          <p className="text-muted-foreground">
            Elige cómo deseas acceder al sistema de mantenimiento
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Platform */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Monitor className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Panel de Administración</CardTitle>
                    <CardDescription>Gestión completa del sistema</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">Escritorio</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span>Dashboard y reportes completos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span>Gestión de órdenes de trabajo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Administración de usuarios</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Configuración del sistema</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6" 
                onClick={() => handlePlatformSelection('admin')}
                disabled={loading !== null}
              >
                {loading === 'admin' ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Cargando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Acceder al Panel
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Mobile Platform */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Smartphone className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Aplicación Móvil</CardTitle>
                    <CardDescription>Para técnicos en campo</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                  Móvil
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span>Órdenes de trabajo asignadas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span>Captura de fotos y videos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Formularios dinámicos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span>Interfaz optimizada para móvil</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-6 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" 
                onClick={() => handlePlatformSelection('mobile')}
                disabled={loading !== null}
              >
                {loading === 'mobile' ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Cargando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Acceder a Móvil
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Puedes cambiar entre plataformas en cualquier momento desde tu perfil
          </p>
        </div>
      </div>
    </div>
  )
}