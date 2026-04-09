'use server'

import { revalidatePath } from 'next/cache'

/**
 * Генерирует полностью случайный заказ программно.
 */
export async function createRandomOrder() {
  try {
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

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]

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

    // ХАРДКОД URL для обхода проблем с переменными окружения Vercel
    const backendUrl = 'https://gbc-backend.vercel.app'
    const finalUrl = `${backendUrl}/api/v1/orders/create`

    console.log(`[Action] Triggering order creation to: ${finalUrl}`)

    try {
      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData),
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }))
        return { 
          success: false, 
          error: `Backend Error (${response.status}): ${errorData.detail || 'Unknown error'}` 
        }
      }

      revalidatePath('/')
      return { success: true }
    } catch (fetchError: any) {
      const detailedError = fetchError.cause?.message || fetchError.message || 'Unknown network error'
      return { 
        success: false, 
        error: `Connection failed: ${detailedError}. URL: ${finalUrl}` 
      }
    }
  } catch (outerError: any) {
    return { success: false, error: outerError.message }
  }
}
