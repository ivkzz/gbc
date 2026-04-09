import { LogoutButton } from '@/components/LogoutButton'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

interface DashboardHeaderProps {
  email?: string
}

/**
 * Серверный компонент хедера панели управления.
 * Использует LogoutButton (client component) для интерактивности.
 */
export function DashboardHeader({ email }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 justify-between shadow-sm">
      <Logo orientation="horizontal" size="sm" />
      <div className="flex items-center gap-4 sm:gap-6">
        <ThemeToggle />
        {email && (
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">Admin Access</span>
            <span className="text-sm font-bold text-foreground/90">{email}</span>
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  )
}

