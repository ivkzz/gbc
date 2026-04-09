'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function OrdersChart({ data }: { data: { created_at: string, total: number | string }[] }) {
  // Сортируем данные хронологически
  const sortedData = [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Переходим на метки времени (timestamp), чтобы каждая точка была уникальной
  const chartData = sortedData.map((order, index) => {
    const d = new Date(order.created_at);
    return {
      // Используем время в мс + индекс для гарантии уникальности, даже если время совпадает
      time: d.getTime() + index,
      displayDate: d.toLocaleString('ru-RU', { day: 'numeric', month: 'short' }),
      fullDate: d.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }),
      sum: Number(order.total || 0),
    };
  })

  return (
    <div className="h-[350px] w-full min-w-0 mt-4">
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(ts) => new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'short' })}
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={50}
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toLocaleString()} ₸`}
            tick={{ fill: '#64748b' }}
          />
          <Tooltip
            cursor={{ stroke: '#2563eb', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white p-3 border rounded-lg shadow-xl ring-1 ring-black/5 min-w-[200px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b pb-1">
                      {item.fullDate}
                    </p>
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <span className="text-sm text-slate-600">Сумма заказа:</span>
                      <span className="text-lg font-black text-blue-600">
                        {item.sum.toLocaleString()} ₸
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="sum"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSum)"
            animationDuration={1000}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
