'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function OrdersChart({ data }: { data: { created_at: string, total: number | string }[] }) {
  // Простая агрегация данных по датам (предполагаем формат YYYY-MM-DD для простоты)
  const chartDataMap = data.reduce((acc: Record<string, { date: string, sum: number, count: number }>, order) => {
    // В реальном проекте используем date-fns или dayjs
    const date = new Date(order.created_at).toLocaleDateString('ru-RU')
    if (!acc[date]) {
      acc[date] = { date, sum: 0, count: 0 }
    }
    acc[date].sum += Number(order.total || 0)
    acc[date].count += 1
    return acc
  }, {})

  const chartData = Object.values(chartDataMap)

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} ₸`}
          />
          <Tooltip 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value} ₸`, 'Сумма']} 
            labelStyle={{ color: 'black' }} 
          />
          <Line
            type="monotone"
            dataKey="sum"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
