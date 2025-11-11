'use client'

import { useState, useEffect } from 'react'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading and check if user is logged in
    const checkAuth = () => {
      const user = localStorage.getItem('aiostore_user')
      if (user) {
        // User is logged in, redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        // User is not logged in, redirect to login
        window.location.href = '/login'
      }
    }

    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false)
      checkAuth()
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AIOStore...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">AIOStore</h1>
        <p className="mt-2 text-gray-600">Multi-platform E-commerce Management System</p>
        <div className="mt-4">
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  )
}