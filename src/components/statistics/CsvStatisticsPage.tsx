'use client'

import React, { useState } from 'react'
import CsvManager from './CsvManager'
import { Button } from '@/components/ui/button'

// Define the allowed modes as a union type
type CsvManagerMode = 'view' | 'add' | 'remove'

export default function CsvStatisticsPage() {
  const [mode, setMode] = useState<CsvManagerMode>('view')

  const handleComplete = () => {
    setMode('view')
  }

  const handleCancel = () => {
    setMode('view')
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">CSV Statistics</h1>

      <CsvManager
        mode={mode}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  )
}
