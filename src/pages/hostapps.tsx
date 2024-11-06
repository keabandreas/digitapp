import React, { useState } from 'react'
import { CardHeader, CardContent } from "@/components/ui/card"
import SftpUserCreationForm from '@/components/SftpUserCreationForm'
import HandbrakeProcessorForm from '@/components/HandbrakeProcessorForm'
import { PasswordPrompt } from '@/components/PasswordPrompt'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GlowingStarsBackgroundCard, GlowingStarsTitle } from "@/components/ui/glowing-stars"

export default function HostApplications() {
  // State declarations
  const [isSftpFormOpen, setIsSftpFormOpen] = useState(false)
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false)
  const [isHandbrakeFormOpen, setIsHandbrakeFormOpen] = useState(false)
  const [sftpPassword, setSftpPassword] = useState<string>("")

  // Event handlers
  const handleHandbrakeClick = () => {
    setIsPasswordPromptOpen(true)
  }

  const handlePasswordSubmit = (password: string) => {
    setSftpPassword(password)
    setIsPasswordPromptOpen(false)
    setIsHandbrakeFormOpen(true)
  }

  const handleHandbrakeClose = () => {
    setIsHandbrakeFormOpen(false)
    setSftpPassword("")
  }

  // Component render
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Host Applications</h1>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GlowingStarsBackgroundCard
          onClick={() => setIsSftpFormOpen(true)}
        >
          <CardHeader>
            <GlowingStarsTitle>Create SFTP User</GlowingStarsTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">Click to create a new SFTP user</p>
          </CardContent>
        </GlowingStarsBackgroundCard>

        <GlowingStarsBackgroundCard
          onClick={handleHandbrakeClick}
        >
          <CardHeader>
            <GlowingStarsTitle>Video Processor</GlowingStarsTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">Convert and process video files using HandBrake</p>
          </CardContent>
        </GlowingStarsBackgroundCard>
      </div>

      {/* SFTP User Creation Dialog */}
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

      {/* Password Prompt Dialog */}
      <PasswordPrompt 
        isOpen={isPasswordPromptOpen}
        onPasswordSubmit={handlePasswordSubmit}
        onClose={() => {
          setIsPasswordPromptOpen(false)
          setSftpPassword("")
        }}
      />

      {/* Handbrake Processor Dialog */}
      {sftpPassword && (
        <Dialog 
          open={isHandbrakeFormOpen} 
          onOpenChange={(open) => {
            if (!open) handleHandbrakeClose()
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
              onProcessingComplete={handleHandbrakeClose} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
