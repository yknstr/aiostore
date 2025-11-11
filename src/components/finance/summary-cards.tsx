'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpDown } from 'lucide-react'

interface SummaryCardsProps {
  income: number
  expenses: number
  netProfit: number
}

export function SummaryCards({ income, expenses, netProfit }: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getProfitMargin = () => {
    if (income === 0) return 0
    return (netProfit / income) * 100
  }

  const profitMargin = getProfitMargin()
  const isProfitPositive = netProfit >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Revenue */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(income)}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium ml-1">
                +12.5%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-green-100">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Total Expenses */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(expenses)}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 font-medium ml-1">
                +8.3%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-red-100">
            <ArrowUpDown className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </Card>

      {/* Net Profit */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Net Profit</p>
            <p className={`text-2xl font-bold mt-2 ${
              isProfitPositive ? 'text-green-900' : 'text-red-900'
            }`}>
              {formatCurrency(netProfit)}
            </p>
            <div className="flex items-center mt-2">
              {isProfitPositive ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium ml-1">
                    +{profitMargin.toFixed(1)}% margin
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 font-medium ml-1">
                    {profitMargin.toFixed(1)}% margin
                  </span>
                </>
              )}
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${
            isProfitPositive ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isProfitPositive ? (
              <TrendingUp className={`w-6 h-6 ${
                isProfitPositive ? 'text-green-600' : 'text-red-600'
              }`} />
            ) : (
              <TrendingDown className={`w-6 h-6 ${
                isProfitPositive ? 'text-green-600' : 'text-red-600'
              }`} />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}