'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { PlatformType } from '@/types/product'
import { Order } from '@/types/order'

interface FiltersContextType {
  // Product filters
  productFilters: {
    platform: 'all' | PlatformType
    status: 'all' | 'active' | 'inactive' | 'out_of_stock'
    category: 'all' | string
  }
  setProductFilters: (filters: any) => void
  
  // Order filters
  orderFilters: {
    platform: PlatformType | 'all'
    status: Order['orderStatus'] | 'all'
    dateRange: 'today' | 'week' | 'month' | 'all'
  }
  setOrderFilters: (filters: any) => void
  
  // Common filter actions
  clearProductFilters: () => void
  clearOrderFilters: () => void
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [productFilters, setProductFilters] = useState({
    platform: 'all' as const,
    status: 'all' as const,
    category: 'all' as const,
  })

  const [orderFilters, setOrderFilters] = useState({
    platform: 'all' as const,
    status: 'all' as const,
    dateRange: 'all' as const,
  })

  const clearProductFilters = () => {
    setProductFilters({
      platform: 'all',
      status: 'all',
      category: 'all',
    })
  }

  const clearOrderFilters = () => {
    setOrderFilters({
      platform: 'all',
      status: 'all',
      dateRange: 'all',
    })
  }

  return (
    <FiltersContext.Provider
      value={{
        productFilters,
        setProductFilters,
        orderFilters,
        setOrderFilters,
        clearProductFilters,
        clearOrderFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider')
  }
  return context
}