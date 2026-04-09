'use client'

import { Button } from '@/components/ui/button'
import { logout } from '@/(auth)/login/actions'
import { useTransition } from 'react'

/**
 * Небольшой клиентский компонент для кнопки выхода.
 * Позволяет основной части хедера оставаться серверным компонентом.
 */
import { LogOut } from 'lucide-react'

/**
 * Небольшой клиентский компонент для кнопки выхода.
 * Оптимизирован для премиального отображения в обеих темах.
 */
export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      disabled={isPending}
      onClick={handleLogout}
      className="group relative flex items-center gap-2 border-border/60 bg-background/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300 font-bold shadow-sm active:scale-95"
    >
      <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
      <span>{isPending ? 'Выход...' : 'Выйти'}</span>
    </Button>
  )
}

