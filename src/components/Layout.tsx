"use client"

import React, { ReactNode } from 'react'
import FloatingDock from '@/components/ui/floating-dock'
import 'tailwind-scrollbar-hide'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen h-screen w-screen bg-background overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
      <FloatingDock />
    </div>
  )
}
