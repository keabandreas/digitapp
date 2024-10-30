// src/components/layout.tsx
"use client"
import React, { ReactNode } from 'react'
import FloatingDock from '@/components/ui/floating-dock'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-background">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">digitAPP</h1>
        <ThemeSwitcher />
      </header>
      <div className="flex-grow flex overflow-hidden">
        <main className="flex-grow overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
      <FloatingDock />
    </div>
  )
}
