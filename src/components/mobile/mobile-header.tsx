"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Menu, AlertTriangle, LogOut, Building2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

export function MobileHeader() {
  const { user } = useCurrentUser()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      toast.success("Sesión cerrada exitosamente")
      router.push("/login")
    } catch (error) {
      toast.error("Error al cerrar sesión")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <header className="bg-background p-4 ">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          {user.company?.logo ? (
            <div className="relative w-14 h-14">
              <Image
                src={user.company.logo}
                alt={user.company.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <div>
            {user.site?.name && (
              <p className="text-sm text-muted-foreground">{user.site.name}</p>
            )}
          </div>
        </div>

        {/* Avatar y menú */}
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.role?.replace('_', ' ')}
                    </p>
                  </div>
                </SheetTitle>
                <SheetDescription>
                  {user.company?.name}
                  {user.site?.name && ` • ${user.site.name}`}
                </SheetDescription>
              </SheetHeader>

              <div className="py-6">
                <Separator />
              </div>

              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsOpen(false)
                    router.push("/mobile")
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mr-3" />
                  Alertas
                </Button>

                <Separator className="my-4" />

                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setIsOpen(false)
                    handleSignOut()
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}