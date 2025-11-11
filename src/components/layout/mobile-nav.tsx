'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sidebar } from './sidebar'
import { X } from 'lucide-react'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  // Close mobile nav when route changes
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [pathname, isOpen, onClose])

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />

      {/* Mobile Navigation */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
        <div className="flex h-full bg-white shadow-xl">
          {/* Sidebar */}
          <div className="flex-1">
            <Sidebar />
          </div>

          {/* Close button */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="m-2"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}