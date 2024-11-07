// src/components/layout.tsx
"use client"
import React, { ReactNode } from 'react'
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col w-screen h-screen">
      <header className="p-4 flex justify-between items-center absolute top-0 left-0 right-0 z-50 bg-transparent">
        <h1 className="text-2xl font-bold"></h1>
        <ThemeToggle />
      </header>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  )
}