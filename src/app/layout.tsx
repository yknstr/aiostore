import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { AppProviders } from '@/contexts/AppProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AIOStore - Multi-platform E-commerce Management',
  description: 'Manage your products, orders, and analytics across Shopee, TikTok Shop, and Tokopedia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          {children}
          <Toaster position="top-right" />
        </AppProviders>
      </body>
    </html>
  )
}