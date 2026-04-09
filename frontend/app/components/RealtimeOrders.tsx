'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function RealtimeOrders() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Подписка на новые заказы в таблице orders
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new
          
          // Отображаем уведомление
          toast.success('Новый заказ!', {
            description: `${newOrder.first_name} ${newOrder.last_name} — ${Number(newOrder.total).toLocaleString('ru-RU')} ₸`,
            action: {
              label: 'Обновить',
              onClick: () => router.refresh(),
            },
          })

          // Автоматически обновляем данные на странице (статистика и список)
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  return null // Компонент не рендерит UI сам по себе
}
