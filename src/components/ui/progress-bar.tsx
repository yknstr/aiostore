'use client'

import React from 'react'

interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

// Using CSS custom property with Tailwind arbitrary properties for build-safe dynamic width
export function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, ((current - 1) / (total - 1)) * 100))
  
  return (
    <div
      className={`h-full bg-green-500 transition-all duration-500 w-[var(--progress-width)] [--progress-width:${percentage}%] ${className}`}
      data-progress={`${current}/${total}`}
    />
  )
}