"use client"

import React from 'react'
import { TracingBeam } from "@/components/ui/tracing-beam"
import { FloatingNavbar } from "@/components/FloatingNavbar"

interface WikiPageProps {
  children: React.ReactNode
}

export const WikiPage: React.FC<WikiPageProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <FloatingNavbar />
      <main className="flex-1 overflow-auto pt-20">
        <TracingBeam>
          <div className="max-w-2xl mx-auto px-4 py-8">
            {children}
          </div>
        </TracingBeam>
      </main>
    </div>
  )
}
