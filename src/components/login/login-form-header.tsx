interface LoginFormHeaderProps {
  displayCompanyName: string
}

export function LoginFormHeader({ displayCompanyName }: LoginFormHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
      <p className="text-muted-foreground text-sm text-balance">
        Inicia sesión en tu cuenta de {displayCompanyName}
      </p>
    </div>
  )
}