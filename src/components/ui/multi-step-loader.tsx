"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface Step {
  title: string
  description: string
}

interface MultiStepLoaderProps {
  steps: Step[]
  currentStep: number
  className?: string
  variant?: "default" | "success" | "destructive"
  showStepDescription?: boolean
}

export function MultiStepLoader({ 
  steps, 
  currentStep, 
  className,
  variant = "default",
  showStepDescription = true
}: MultiStepLoaderProps) {
  const getStepColor = (isActive: boolean, isCompleted: boolean) => {
    if (variant === "destructive") {
      return isCompleted
        ? "rgb(191 97 106)"  // red-500
        : isActive
        ? "rgb(191 97 106)"  // red-500
        : "rgb(163 190 140)" // slate-400
    }
    
    if (variant === "success") {
      return isCompleted
        ? "rgb(163 190 140)"  // green-500
        : isActive
        ? "rgb(163 190 140)"  // green-500
        : "rgb(163 190 140)" // slate-400
    }

    return isCompleted
      ? "rgb(163 190 140)"    // green-500
      : isActive
      ? "rgb(129 161 193)"   // blue-500
      : "rgb(163 190 140)"  // slate-400
  }

  return (
    <div className={cn("relative", className)}>
      {steps.map((step, index) => {
        const isActive = currentStep === index
        const isCompleted = currentStep > index

        return (
          <div
            key={step.title}
            className={cn(
              "flex items-center gap-4 p-4",
              index !== steps.length - 1 && "border-b border-border"
            )}
          >
            <div className="relative">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: getStepColor(isActive, isCompleted)
                }}
                className="h-4 w-4 rounded-full"
              />
              {index !== steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-2 top-4 h-full w-[2px]",
                    isCompleted ? "bg-primary" : "bg-border"
                  )} 
                />
              )}
            </div>
            <div>
              <p
                className={cn(
                  "font-medium",
                  isActive && "text-blue-500",
                  isCompleted && "text-green-500"
                )}
              >
                {step.title}
              </p>
              {showStepDescription && isActive && (
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}