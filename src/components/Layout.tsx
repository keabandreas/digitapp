"use client"

import React, { ReactNode } from 'react'
import FloatingDock from '@/components/ui/floating-dock'
import dynamic from 'next/dynamic'
import 'tailwind-scrollbar-hide'

const TracingBeam = dynamic(() => import("@/components/ui/tracing-beam").then(mod => mod.TracingBeam), { ssr: false })

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="flex-1 relative">
        <TracingBeam className="absolute inset-0">
          <div className="h-full overflow-y-scroll scrollbar-hide">
            <main className="pb-20">
              {children}
            </main>
          </div>
        </TracingBeam>
      </div>
      <FloatingDock />
    </div>
  )
}
