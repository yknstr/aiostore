'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { AnalyticsProvider } from './AnalyticsContext'
import { FiltersProvider } from './FiltersContext'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <FiltersProvider>
          {children}
        </FiltersProvider>
      </AnalyticsProvider>
    </AuthProvider>
  )
}