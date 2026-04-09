'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

export async function createRandomOrder() {
  try {
    // Читаем моковые данные
    // Путь к файлу в корне проекта. 
    // Так как это исполняется в frontend/app/actions, идем наверх
    const filePath = path.join(process.cwd(), '..', 'mock_orders.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const mockOrders = JSON.parse(fileContent)

    // Выбираем случайный заказ
    const randomOrder = mockOrders[Math.floor(Math.random() * mockOrders.length)]

    // Форматируем данные для нашего бэкенда
    const orderData = {
      firstName: randomOrder.firstName,
      lastName: randomOrder.lastName,
      phone: randomOrder.phone,
      email: randomOrder.email,
      orderType: randomOrder.orderType || 'eshop-individual',
      orderMethod: randomOrder.orderMethod || 'shopping-cart',
      status: randomOrder.status || 'new',
      items: randomOrder.items.map((item: any) => ({
        productName: item.productName,
        initialPrice: item.initialPrice,
        quantity: item.quantity
      }))
    }

    // Отправляем на наш бэкенд (FastAPI)
    // В продакшене URL должен быть в .env
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Backend error:', errorData)
      return { success: false, error: errorData.detail || 'Failed to create order via backend' }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Action error:', error)
    return { success: false, error: error.message }
  }
}
