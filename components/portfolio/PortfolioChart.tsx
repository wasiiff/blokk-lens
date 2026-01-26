'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'

interface Balance {
  chain: string
  chainName: string
  symbol: string
  value: number
  type?: 'native' | 'token'
}

interface PortfolioChartProps {
  balances: Balance[]
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#ef4444', // red
  '#10b981', // green
  '#f97316', // orange
  '#ec4899', // pink
  '#6366f1', // indigo
]

export default function PortfolioChart({ balances }: PortfolioChartProps) {
  const chartData = useMemo(() => {
    // Group by chain and sum values
    const chainTotals = balances.reduce((acc, balance) => {
      const key = balance.chainName
      if (!acc[key]) {
        acc[key] = {
          name: balance.chainName,
          value: 0,
        }
      }
      acc[key].value += balance.value
      return acc
    }, {} as Record<string, { name: string; value: number }>)

    return Object.values(chainTotals)
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
      }))
  }, [balances])

  const totalValue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  const dataWithPercentage = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      percentage: ((item.value / totalValue) * 100).toFixed(1),
    }))
  }, [chartData, totalValue])

  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="glass-card-light rounded-lg p-3 shadow-lg border border-border">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm font-medium text-primary mt-1">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">{data.percentage}%</p>
        </div>
      )
    }
    return null
  }

  if (balances.length === 0) return null

  return (
    <div className="glass-card-light rounded-2xl p-6 border border-border/60 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold card-text">Distribution</h3>
          <p className="text-xs card-text-muted">By network</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[280px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercentage}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              paddingAngle={2}
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-6 max-h-[220px] overflow-y-auto pr-1">
        {dataWithPercentage.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-background group-hover:scale-110 transition-transform"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-semibold card-text truncate">
                {entry.name}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-muted-foreground">
                {entry.percentage}%
              </span>
              <span className="text-xs font-bold card-text">
                {formatCurrency(entry.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
