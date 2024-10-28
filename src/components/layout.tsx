"use client"

import React, { ReactNode } from 'react'
import FloatingDock from '@/components/ui/floating-dock'
import 'tailwind-scrollbar-hide'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-background">
      <div className="flex-grow flex overflow-hidden">
        <main className="flex-grow overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
      <FloatingDock />
    </div>
  )
}
