'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { createRandomOrder } from '@/actions/orders'

export function CreateOrderButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateOrder = async () => {
    setIsLoading(true)
    try {
      const result = await createRandomOrder()
      if (result.success) {
        // Можно добавить уведомление здесь, если есть библиотека toast
        console.log('Order created successfully')
      } else {
        console.error('Failed to create order:', result.error)
      }
    } catch (error) {
      console.error('An error occurred:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCreateOrder}
      disabled={isLoading}
      variant="outline"
      className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all duration-300 shadow-sm hover:shadow-md group"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
      )}
      Создать случайный заказ Retailcrm
    </Button>
  )
}
