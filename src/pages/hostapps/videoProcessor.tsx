// @/pages/hostapps/videoProcessor.tsx
import React, { useState, useEffect } from 'react'
import { create } from "zustand"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HandbrakeProcessorForm } from '@/components/hostapps/HandbrakeProcessorForm'
import { toast } from "sonner"

// Types
export type ProcessingStep = {
  title: string
  description: string
}

export type ProcessingState = {
  isProcessing: boolean
  currentStep: number
  progress: number
  steps: ProcessingStep[]
}

// Password Store
interface PasswordPromptStore {
  isOpen: boolean
  password: string
  setIsOpen: (isOpen: boolean) => void
  setPassword: (password: string) => void
  reset: () => void
}

export const usePasswordPromptStore = create<PasswordPromptStore>((set) => ({
  isOpen: false,
  password: "",
  setIsOpen: (isOpen) => set({ isOpen }),
  setPassword: (password) => set({ password }),
  reset: () => set({ isOpen: false, password: "" })
}))

// Video Processing Dialog Store
interface VideoProcessorStore {
  isOpen: boolean
  processingState: ProcessingState | null
  setIsOpen: (isOpen: boolean) => void
  setProcessingState: (state: ProcessingState | null) => void
}

export const useVideoProcessorStore = create<VideoProcessorStore>((set) => ({
  isOpen: false,
  processingState: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setProcessingState: (state) => set({ processingState: state })
}))

export const PROCESSING_STEPS: ProcessingStep[] = [
  {
    title: "Uploading File",
    description: "Transferring file to SFTP server..."
  },
  {
    title: "Preparing",
    description: "Setting up HandBrake processor..."
  },
  {
    title: "Converting",
    description: "Processing video with selected preset..."
  },
  {
    title: "Finalizing",
    description: "Cleaning up and verifying output..."
  }
]

// Core processing function
type ProcessVideoParams = {
  file: File
  presetIndex: number
  sftpPassword: string
  onProgressUpdate: (state: ProcessingState) => void
  onComplete: () => void
  onError: (error: string) => void
}

async function processVideo({
  file,
  presetIndex,
  sftpPassword,
  onProgressUpdate,
  onComplete,
  onError
}: ProcessVideoParams) {
  let uploadInterval: NodeJS.Timeout
  let processInterval: NodeJS.Timeout
  let finalizationInterval: NodeJS.Timeout

  try {
    onProgressUpdate({
      isProcessing: true,
      currentStep: 0,
      progress: 0,
      steps: PROCESSING_STEPS
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', sftpPassword)

    uploadInterval = setInterval(() => {
      onProgressUpdate((prev) => ({
        ...prev,
        progress: Math.min(prev.progress + 1, 25)
      }))
    }, 100)

    const uploadResponse = await fetch('/api/hostapps/handbrake?action=upload_file', {
      method: 'POST',
      body: formData
    })

    clearInterval(uploadInterval)

    if (!uploadResponse.ok) {
      const data = await uploadResponse.json()
      throw new Error(data.error || data.details || 'Upload failed')
    }

    onProgressUpdate({
      isProcessing: true,
      currentStep: 1,
      progress: 25,
      steps: PROCESSING_STEPS
    })

    await new Promise(resolve => setTimeout(resolve, 1500))

    onProgressUpdate({
      isProcessing: true,
      currentStep: 2,
      progress: 30,
      steps: PROCESSING_STEPS
    })

    processInterval = setInterval(() => {
      onProgressUpdate((prev) => ({
        ...prev,
        progress: Math.min(prev.progress + 0.5, 90)
      }))
    }, 200)

    const processResponse = await fetch('/api/hostapps/handbrake?action=process_file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: file.name,
        preset_index: presetIndex,
        password: sftpPassword
      })
    })

    clearInterval(processInterval)

    if (!processResponse.ok) {
      throw new Error('Processing failed')
    }

    onProgressUpdate({
      isProcessing: true,
      currentStep: 3,
      progress: 95,
      steps: PROCESSING_STEPS
    })

    finalizationInterval = setInterval(() => {
      onProgressUpdate((prev) => ({
        ...prev,
        progress: Math.min(prev.progress + 1, 100)
      }))
    }, 100)

    await new Promise(resolve => setTimeout(resolve, 1000))
    clearInterval(finalizationInterval)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onComplete()

  } catch (error) {
    if (uploadInterval) clearInterval(uploadInterval)
    if (processInterval) clearInterval(processInterval)
    if (finalizationInterval) clearInterval(finalizationInterval)

    onError(error instanceof Error ? error.message : "Processing failed")
  }
}

// Password Prompt Component
export function PasswordPromptDialog() {
  const [password, setPassword] = useState("")
  const { isOpen, setIsOpen, setPassword: storePassword, reset } = usePasswordPromptStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    storePassword(password)
    setPassword("")
    setIsOpen(false)
  }

  const handleClose = () => {
    setPassword("")
    reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose()
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter SFTP Password</DialogTitle>
          <DialogDescription>
            Please provide your SFTP password to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Video Processor Dialog Component
export function VideoProcessorDialog() {
  const [presets, setPresets] = useState<Array<{ name: string; path: string | null }>>([])
  const { isOpen, setIsOpen, setProcessingState } = useVideoProcessorStore()

  useEffect(() => {
    if (isOpen) {
      fetchPresets()
    }
  }, [isOpen])

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/hostapps/handbrake?action=list_presets')
      const data = await response.json()
      if (data.presets) {
        setPresets(data.presets)
      }
    } catch (error) {
      toast.error("Failed to fetch presets")
    }
  }

  const handleProcessingStart = async (file: File, presetIndex: number) => {
    setIsOpen(false)
    
    try {
      await startVideoProcessing({
        file,
        presetIndex,
        onProgressUpdate: (state) => setProcessingState(state),
        onComplete: () => {
          toast.success("Video processing completed")
          setProcessingState(null)
        },
        onError: (error) => {
          toast.error(error)
          setProcessingState(null)
        }
      })
    } catch (error) {
      console.log("Processing was cancelled or failed")
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Video Processor</DialogTitle>
          <DialogDescription>
            Select a video file and processing options to convert.
          </DialogDescription>
        </DialogHeader>
        <HandbrakeProcessorForm 
          presets={presets}
          onProcessingStart={handleProcessingStart}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

// Helper function to open the video processor dialog
export function openVideoProcessor() {
  useVideoProcessorStore.getState().setIsOpen(true)
}

// Public interface for video processing
type StartVideoProcessingParams = {
  file: File
  presetIndex: number
  onProgressUpdate: (state: ProcessingState) => void
  onComplete: () => void
  onError: (error: string) => void
}

export function startVideoProcessing({
  file,
  presetIndex,
  onProgressUpdate,
  onComplete,
  onError
}: StartVideoProcessingParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const passwordStore = usePasswordPromptStore.getState()
    passwordStore.setIsOpen(true)

    const cleanup = usePasswordPromptStore.subscribe((state) => {
      if (!state.isOpen && state.password) {
        cleanup()
        processVideo({
          file,
          presetIndex,
          sftpPassword: state.password,
          onProgressUpdate,
          onComplete: () => {
            passwordStore.reset()
            onComplete()
            resolve()
          },
          onError: (error) => {
            passwordStore.reset()
            onError(error)
            reject(error)
          }
        })
      } else if (!state.isOpen && !state.password) {
        cleanup()
        const error = "Password not provided"
        onError(error)
        reject(error)
      }
    })
  })
}