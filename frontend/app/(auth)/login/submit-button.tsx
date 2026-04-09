'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="min-w-[120px] mt-2 font-bold px-8 transition-all active:scale-95 shadow-lg shadow-primary/20"
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin font-black" />}
      {pending ? 'Вход...' : 'Войти'}
    </Button>
  )
}
