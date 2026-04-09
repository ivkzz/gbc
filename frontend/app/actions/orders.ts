'use server'

import { revalidatePath } from 'next/cache'

/**
 * Генерирует полностью случайный заказ программно.
 * Идеально подходит для Vercel, так как не требует чтения локальных файлов.
 */
export async function createRandomOrder() {
  try {
    // Наборы данных для генерации
    const firstNames = ['Айгуль', 'Дина', 'Нургуль', 'Малика', 'Зарина', 'Ирина', 'Светлана', 'Гульнара', 'Анара', 'Камила']
    const lastNames = ['Касымова', 'Жуматова', 'Ахметова', 'Сейткали', 'Байжанова', 'Соколова', 'Морозова', 'Кенжебаева', 'Мухамедова', 'Досова']
    const products = [
      { name: 'Корректирующее бельё Nova Classic', price: 65000 },
      { name: 'Утягивающий комбидресс Nova Slim', price: 100000 },
      { name: 'Корректирующие шорты Nova Shape', price: 78000 },
      { name: 'Бюстье корректирующее Nova Lift', price: 55000 },
      { name: 'Утягивающие леггинсы Nova Fit', price: 51500 },
      { name: 'Утягивающее боди Nova Body', price: 58000 }
    ]
    const cities = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе']

    // Выбираем случайные значения
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]

    // Генерируем от 1 до 3 товаров
    const itemsCount = Math.floor(Math.random() * 3) + 1
    const selectedItems = []
    for (let i = 0; i < itemsCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      selectedItems.push({
        productName: product.name,
        initialPrice: product.price,
        quantity: Math.floor(Math.random() * 2) + 1
      })
    }

    const orderData = {
      firstName,
      lastName,
      phone: `+770${Math.floor(Math.random() * 8999999) + 1000000}`,
      email: `${firstName.toLowerCase().replace('а', 'a').replace('г', 'g')}@example.com`,
      orderType: 'eshop-individual',
      orderMethod: 'shopping-cart',
      status: 'new',
      items: selectedItems,
      delivery: {
        address: {
          city: city,
          text: `ул. Тестовая ${Math.floor(Math.random() * 100) + 1}, кв ${Math.floor(Math.random() * 50) + 1}`
        }
      }
    }

    // Отправляем на бэкенд (FastAPI)
    // В Vercel обязательно установите переменную BACKEND_API_URL
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    console.log(`Sending to backend: ${backendUrl}/api/v1/orders/create`)

    const response = await fetch(`${backendUrl}/api/v1/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }))
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
