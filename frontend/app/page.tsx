import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import OrdersChart from '@/components/OrdersChart'
import { logout } from './login/actions'
import { Button } from '@/components/ui/button'

export const revalidate = 0 // Опционально, чтобы Next.js не кэшировал данные статической страницей

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: userData } = await supabase.auth.getUser()

  // Получаем последние заказы (с сортировкой по новизне)
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  // Расчет метрик
  const totalRevenue = orders?.reduce((acc, order) => acc + Number(order.total || 0), 0) || 0
  const totalOrders = orders?.length || 0

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="flex h-16 items-center gap-4 border-b bg-background px-6 justify-between">
        <div className="flex font-semibold tracking-tight">RetailCRM &rarr; Supabase Dashboard</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userData?.user?.email}</span>
          <form action={logout}>
            <Button variant="outline" size="sm">Выйти</Button>
          </form>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString('ru-RU')} ₸</div>
              <p className="text-xs text-muted-foreground">За все время</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Количество заказов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalOrders}</div>
              <p className="text-xs text-muted-foreground">За все время</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Динамика заказов</CardTitle>
              <CardDescription>Сумма выручки по дням</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersChart data={orders || []} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Последние заказы</CardTitle>
              <CardDescription>Недавно синхронизировано из RetailCRM</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.first_name} {order.last_name}
                      </TableCell>
                      <TableCell>{Number(order.total || 0).toLocaleString('ru-RU')} ₸</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.status || 'new'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        Заказов пока нет
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
