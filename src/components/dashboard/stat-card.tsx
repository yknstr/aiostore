'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  description, 
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      'bg-white p-6 rounded-lg border shadow-sm transition-shadow hover:shadow-md',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        <div className="ml-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg">
            <div className="text-primary-600">
              {icon}
            </div>
          </div>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
          )}
          <span className={cn(
            'text-sm font-medium',
            trend.isPositive ? 'text-success-600' : 'text-danger-600'
          )}>
            {Math.abs(trend.value).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      )}
    </div>
  )
}