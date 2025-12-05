"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { WifiOff, ArrowLeft, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Offline Page
 *
 * Shown when user tries to navigate to a page that's not cached
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Clean, focused UI
 * - Auto-reload when back online
 */
export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Listen for online event
    const handleOnline = () => {
      setIsOnline(true)
      // Auto reload after 1 second
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Auto check every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && !isOnline) {
        setIsOnline(true)
        window.location.reload()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isOnline])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-10 h-10 text-amber-600 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-3">
            Sin Conexión a Internet
          </h1>

          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            Esta página no está disponible sin conexión. Intenta de nuevo cuando
            tengas internet.
          </p>

          {/* Status Banner */}
          {isOnline ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                </div>
                <span className="text-sm font-medium text-green-800">
                  Conexión restaurada. Recargando...
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Trabajando offline</p>
                  <p className="text-amber-700">
                    Algunas funciones están limitadas sin conexión.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={() => router.back()}
              className="w-full"
              variant="default"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver Atrás
            </Button>

            <Button
              onClick={() => router.push("/mobile")}
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir al Inicio
            </Button>

            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 Páginas disponibles offline:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Órdenes de trabajo que ya visitaste</li>
              <li>• Alertas que ya abriste</li>
              <li>• Activos que ya consultaste</li>
              <li>• Tu registro de asistencia</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
