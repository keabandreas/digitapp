import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import SftpUserCreationForm from '@/components/SftpUserCreationForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function HostApplications() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Host Applications</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsFormOpen(true)}>
          <CardHeader>
            <CardTitle>Create SFTP User</CardTitle>
            <CardDescription>Add a new user to the SFTP server</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Create User
            </Button>
          </CardContent>
        </Card>
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
