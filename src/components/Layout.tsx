import React from 'react'
import FloatingDock from '@/components/ui/floating-dock'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <FloatingDock />
    </div>
  )
}
