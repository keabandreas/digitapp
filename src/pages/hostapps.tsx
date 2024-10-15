import React, { useState } from 'react'
import { CardHeader, CardContent } from "@/components/ui/card"
import SftpUserCreationForm from '@/components/SftpUserCreationForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GlowingStarsBackgroundCard, GlowingStarsDescription, GlowingStarsTitle } from "@/components/ui/glowing-stars"

export default function HostApplications() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleOpenForm = () => {
    setIsFormOpen(true)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Host Applications</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GlowingStarsBackgroundCard 
          onClick={handleOpenForm}
        >
          <CardHeader>
            <GlowingStarsTitle>Create SFTP User</GlowingStarsTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">Click to create a new SFTP user</p>
          </CardContent>
        </GlowingStarsBackgroundCard>
        {/* Add more cards for other host applications here */}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create SFTP User</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new SFTP user.
            </DialogDescription>
          </DialogHeader>
          <SftpUserCreationForm onUserCreated={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
