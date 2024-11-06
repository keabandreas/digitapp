import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import SftpUserCreationForm from '@/components/SftpUserCreationForm'
import { HandbrakeProcessorForm } from '@/components/HandbrakeProcessorForm'
import { PasswordPrompt } from '@/components/PasswordPrompt'
import { VideoProcessorCard } from '@/components/VideoProcessorCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

const PROCESSING_STEPS = [
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

export default function HostApplications() {
  const [isSftpFormOpen, setIsSftpFormOpen] = useState(false)
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false)
  const [isHandbrakeFormOpen, setIsHandbrakeFormOpen] = useState(false)
  const [sftpPassword, setSftpPassword] = useState<string>("")
  const [presets, setPresets] = useState<Array<{ name: string; path: string | null }>>([])
  const [processingState, setProcessingState] = useState<{
    isProcessing: boolean
    currentStep: number
    progress: number
    steps: typeof PROCESSING_STEPS
  } | null>(null)

  useEffect(() => {
    fetchPresets()
  }, [])

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/handbrake?action=list_presets')
      const data = await response.json()
      if (data.presets) {
        setPresets(data.presets)
      }
    } catch (error) {
      toast.error("Failed to fetch presets")
    }
  }

  const handleHandbrakeClick = () => {
    setIsPasswordPromptOpen(true)
  }

  const handlePasswordSubmit = (password: string) => {
    setSftpPassword(password)
    setIsPasswordPromptOpen(false)
    setIsHandbrakeFormOpen(true)
  }

  const handleProcessingStart = async (file: File, presetIndex: number) => {
    setIsHandbrakeFormOpen(false)
    setProcessingState({
      isProcessing: true,
      currentStep: 0,
      progress: 0,
      steps: PROCESSING_STEPS
    })
  
    try {
      // Start upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('password', sftpPassword)
  
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProcessingState(prev => {
          if (prev?.progress && prev.progress < 25) {
            return { ...prev, progress: prev.progress + 1 }
          }
          return prev
        })
      }, 100)
  
      const uploadResponse = await fetch('/api/handbrake?action=upload_file', {
        method: 'POST',
        body: formData
      })
  
      clearInterval(uploadInterval)
  
      if (!uploadResponse.ok) {
        const data = await uploadResponse.json()
        throw new Error(data.error || data.details || 'Upload failed')
      }
  
      // Move to preparation
      setProcessingState(prev => ({
        ...prev!,
        currentStep: 1,
        progress: 25
      }))
  
      // Added delay for visibility
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Start processing
      setProcessingState(prev => ({
        ...prev!,
        currentStep: 2,
        progress: 30
      }))

      // Simulate processing progress
      const processInterval = setInterval(() => {
        setProcessingState(prev => {
          if (prev?.progress && prev.progress < 90) {
            return { ...prev, progress: prev.progress + 0.5 }
          }
          return prev
        })
      }, 200)

      const processResponse = await fetch('/api/handbrake?action=process_file', {
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

      // Move to finalization
      setProcessingState(prev => ({
        ...prev!,
        currentStep: 3,
        progress: 95
      }))

      // Simulate finalization
      const finalizationInterval = setInterval(() => {
        setProcessingState(prev => {
          if (prev?.progress && prev.progress < 100) {
            return { ...prev, progress: prev.progress + 1 }
          }
          return prev
        })
      }, 100)

      await new Promise(resolve => setTimeout(resolve, 1000))
      clearInterval(finalizationInterval)

      toast.success("Video processing completed")
      
      // Keep the completion state visible for a moment
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingState(null)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Processing failed")
      setProcessingState(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Host Applications</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          onClick={() => setIsSftpFormOpen(true)}
          className="cursor-pointer hover:border-primary transition-all duration-300"
        >
          <CardHeader>
            <CardTitle>Create SFTP User</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click to create a new SFTP user
            </p>
          </CardContent>
        </Card>

        <VideoProcessorCard
          onClick={handleHandbrakeClick}
          processingState={processingState}
        />
      </div>

      <Dialog open={isSftpFormOpen} onOpenChange={setIsSftpFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create SFTP User</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new SFTP user.
            </DialogDescription>
          </DialogHeader>
          <SftpUserCreationForm onUserCreated={() => setIsSftpFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <PasswordPrompt 
        isOpen={isPasswordPromptOpen}
        onPasswordSubmit={handlePasswordSubmit}
        onClose={() => {
          setIsPasswordPromptOpen(false)
          setSftpPassword("")
        }}
      />

      <Dialog 
        open={isHandbrakeFormOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsHandbrakeFormOpen(false)
            setSftpPassword("")
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
            password={sftpPassword}
            presets={presets}
            onProcessingStart={handleProcessingStart}
            onCancel={() => {
              setIsHandbrakeFormOpen(false)
              setSftpPassword("")
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}