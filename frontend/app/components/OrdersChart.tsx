'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Order {
  created_at: string
  total: number | string
}

type Period = '24h' | '7d' | '30d' | 'all'

export default function OrdersChart({ data }: { data: Order[] }) {
  const [period, setPeriod] = useState<Period>('all')

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const now = new Date()

    // СПЕЦИАЛЬНЫЙ РЕЖИМ для "Все время" - возвращаем ту самую любимую кривую
    if (period === 'all') {
      return sorted.map((o, i) => {
        const d = new Date(o.created_at)
        return {
          label: d.toLocaleString('ru-RU', { day: 'numeric', month: 'short' }),
          total: Number(o.total || 0),
          count: 1,
          fullLabel: d.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
          idx: i // Для уникальности ключа в Recharts
        }
      })
    }

    // Для остальных табов делаем фиксированную сетку (День / Неделя / Месяц)
    const result = []
    const dailyMap: { [key: string]: { total: number, count: number } } = {}

    if (period === '24h') {
      // Генерируем последние 24 часа
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000)
        const key = `${d.toLocaleDateString('en-CA')} ${d.getHours()}:00`
        dailyMap[key] = { total: 0, count: 0 }
      }
      
      sorted.forEach(o => {
        const d = new Date(o.created_at)
        const key = `${d.toLocaleDateString('en-CA')} ${d.getHours()}:00`
        if (dailyMap[key]) {
          dailyMap[key].total += Number(o.total || 0)
          dailyMap[key].count += 1
        }
      })

      return Object.entries(dailyMap).map(([key, val]) => ({
        label: key.split(' ')[1],
        total: val.total,
        count: val.count,
        fullLabel: key
      }))
    }

    if (period === '7d' || period === '30d') {
      const daysCount = period === '7d' ? 7 : 30
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const key = d.toLocaleDateString('en-CA')
        dailyMap[key] = { total: 0, count: 0 }
      }

      sorted.forEach(o => {
        const d = new Date(o.created_at)
        const key = d.toLocaleDateString('en-CA')
        if (dailyMap[key]) {
          dailyMap[key].total += Number(o.total || 0)
          dailyMap[key].count += 1
        }
      })

      return Object.entries(dailyMap).map(([key, val]) => {
        const d = new Date(key)
        return {
          label: d.toLocaleString('ru-RU', { day: 'numeric', month: 'short' }),
          total: val.total,
          count: val.count,
          fullLabel: d.toLocaleString('ru-RU', { day: 'numeric', month: 'long' })
        }
      })
    }

    return sorted
  }, [data, period])

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
          Аналитика продаж
        </h3>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full sm:w-auto">
          <TabsList className="bg-muted/40 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="24h" className="text-xs">День</TabsTrigger>
            <TabsTrigger value="7d" className="text-xs">Неделя</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs">Месяц</TabsTrigger>
            <TabsTrigger value="all" className="text-xs font-semibold">Все время</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[350px] w-full min-w-0">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted-foreground/10" />
            <XAxis
              dataKey="label"
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              minTickGap={period === 'all' ? 50 : 20}
            />
            <YAxis
              stroke="currentColor"
              className="text-muted-foreground"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
            <Tooltip
              cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '4 4' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-background/95 backdrop-blur-xl p-3 border border-border/50 rounded-xl shadow-2xl min-w-[200px] ring-1 ring-white/5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b border-border/30 pb-1.5 font-mono">
                        {item.fullLabel}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground/70">
                            {item.count > 1 ? 'Заказов:' : 'Заказ:'}
                          </span>
                          <span className="text-xs font-bold text-foreground">{item.count}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-border/20 pt-1.5">
                          <span className="text-xs text-muted-foreground/70">Выручка:</span>
                          <span className="text-base font-black text-blue-500">
                            {item.total.toLocaleString()} ₸
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSum)"
              animationDuration={1000}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
