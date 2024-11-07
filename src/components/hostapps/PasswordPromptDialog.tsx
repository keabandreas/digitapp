import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePasswordPromptStore } from '@/pages/hostapps/videoProcessor'

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