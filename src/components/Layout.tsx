"use client"

import React, { ReactNode } from 'react'
import FloatingDock from '@/components/ui/floating-dock'
import 'tailwind-scrollbar-hide'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 relative">
        <main className="w-full">
          {children}
        </main>
      </div>
      <FloatingDock />
    </div>
  )
}
