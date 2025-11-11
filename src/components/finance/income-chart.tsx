'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Transaction } from '@/types/transaction'
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'

interface IncomeChartProps {
  data: Transaction[]
  dateRange: string
}

export function IncomeChart({ data, dateRange }: IncomeChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Group transactions by date and calculate daily totals
  const dailyData = data.reduce((acc, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = { date, income: 0, expenses: 0, netProfit: 0 }
    }
    
    if (transaction.type === 'income') {
      acc[date].income += transaction.amount
    } else {
      acc[date].expenses += Math.abs(transaction.amount)
    }
    
    acc[date].netProfit = acc[date].income - acc[date].expenses
    return acc
  }, {} as Record<string, { date: string; income: number; expenses: number; netProfit: number }>)

  // Convert to array and sort by date
  const chartData = Object.values(dailyData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {format(new Date(label), 'dd MMMM yyyy', { locale: id })}
          </p>
          <p className="text-sm text-green-600">
            Income: {formatCurrency(data.income)}
          </p>
          <p className="text-sm text-red-600">
            Expenses: {formatCurrency(data.expenses)}
          </p>
          <p className={`text-sm font-medium ${
            data.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            Net Profit: {formatCurrency(data.netProfit)}
          </p>
        </div>
      )
    }
    return null
  }

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM', { locale: id })
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Income bars */}
          <Bar 
            dataKey="income" 
            fill="#10b981"
            radius={[2, 2, 0, 0]}
            name="Income"
          />
          
          {/* Expenses bars */}
          <Bar 
            dataKey="expenses" 
            fill="#ef4444"
            radius={[2, 2, 0, 0]}
            name="Expenses"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}