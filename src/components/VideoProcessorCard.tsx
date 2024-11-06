import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import { cn } from "@/lib/utils"
import { Cpu } from "lucide-react"

interface ProcessingState {
  isProcessing: boolean
  currentStep: number
  progress: number
  steps: {
    title: string
    description: string
  }[]
}

interface VideoProcessorCardProps {
  onClick: () => void
  processingState: ProcessingState | null
}

export function VideoProcessorCard({ onClick, processingState }: VideoProcessorCardProps) {
  return (
    <Card 
      onClick={!processingState?.isProcessing ? onClick : undefined}
      className={cn(
        "relative group hover:shadow-md transition-all duration-300",
        !processingState?.isProcessing && "cursor-pointer hover:border-primary",
        processingState?.isProcessing && "border-primary"
      )}
    >
      {processingState?.isProcessing ? (
        <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 animate-pulse" />
              Processing Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <MultiStepLoader
                steps={processingState.steps}
                currentStep={processingState.currentStep}
              />
              <div className="space-y-2">
                <Progress 
                  value={processingState.progress} 
                  className="h-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {processingState.steps[processingState.currentStep].title}
                  </span>
                  <span>
                    {Math.round(processingState.progress)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Video Processor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Convert and process video files using HandBrake
            </p>
          </CardContent>
        </>
      )}
    </Card>
  )
}