// src/pages/hostapps.tsx
import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import SftpUserCreationForm from '@/components/hostapps/SftpUserCreationForm'
import { VideoProcessorCard } from '@/components/hostapps/VideoProcessorCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { UserPlus } from "lucide-react"
import { 
  openVideoProcessor, 
  VideoProcessorDialog, 
  PasswordPromptDialog, 
  useVideoProcessorStore 
} from '@/pages/hostapps/videoProcessor'

export default function HostApplications() {
  const [isSftpFormOpen, setIsSftpFormOpen] = useState(false)
  const processingState = useVideoProcessorStore((state) => state.processingState)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Host Applications</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          onClick={() => setIsSftpFormOpen(true)}
          className="cursor-pointer hover:border-primary transition-all duration-300"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create SFTP User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click to create a new SFTP user
            </p>
          </CardContent>
        </Card>

        <VideoProcessorCard
          onClick={openVideoProcessor}
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

      <VideoProcessorDialog />
      <PasswordPromptDialog />
    </div>
  )
}