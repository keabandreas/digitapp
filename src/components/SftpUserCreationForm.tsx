import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

interface FormData {
  username: string
  password: string
  firstName: string
  lastName: string
  userType: string
  department: string
  company: string
  responsibleFirstName: string
  responsibleLastName: string
  deletionTime: string
  quotaMB: string
}

interface SftpUserCreationFormProps {
  onUserCreated: () => void
}

export default function SftpUserCreationForm({ onUserCreated }: SftpUserCreationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: '',
    department: '',
    company: '',
    responsibleFirstName: '',
    responsibleLastName: '',
    deletionTime: '',
    quotaMB: '',
  })

  const [message, setMessage] = useState<string>('')
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const userData = {
      username: formData.username,
      password: formData.password,
      user_info: {
        "First name": formData.firstName,
        "Last name": formData.lastName,
        "User Type": formData.userType,
        ...(formData.userType === 'internal' ? {
          "Department": formData.department,
          "Email": `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@karlshamnenergi.se`,
        } : {
          "Company": formData.company,
          "Handled by department": formData.department,
          "Responsible internally first name": formData.responsibleFirstName,
          "Responsible internally last name": formData.responsibleLastName,
          "Responsible internally email": `${formData.responsibleFirstName.toLowerCase()}.${formData.responsibleLastName.toLowerCase()}@karlshamnenergi.se`,
        }),
      },
      deletion_time: formData.deletionTime,
      quotaMB: formData.quotaMB,
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SFTP_PYTHON_API_URL}${process.env.NEXT_PUBLIC_SFTP_PYTHON_APP_CREATE_USER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMessage(data.message || 'User created successfully')
      setIsAlertOpen(true)
      onUserCreated()
    } catch (error) {
      setMessage('Failed to create user: ' + (error as Error).message)
      setIsAlertOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleCreateUser} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userType">User Type</Label>
        <Select
          name="userType"
          onValueChange={(value) => handleSelectChange('userType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select User Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="external">External</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select
          name="department"
          onValueChange={(value) => handleSelectChange('department', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Digit">Digit</SelectItem>
            <SelectItem value="El">El</SelectItem>
            <SelectItem value="Fjarrvarme">Fjarrvarme</SelectItem>
            <SelectItem value="Marknad">Marknad</SelectItem>
            <SelectItem value="Vatten">Vatten</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.userType === 'external' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibleFirstName">Responsible First Name</Label>
            <Input
              id="responsibleFirstName"
              name="responsibleFirstName"
              value={formData.responsibleFirstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibleLastName">Responsible Last Name</Label>
            <Input
              id="responsibleLastName"
              name="responsibleLastName"
              value={formData.responsibleLastName}
              onChange={handleInputChange}
            />
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="deletionTime">Deletion Time</Label>
        <Select
          name="deletionTime"
          onValueChange={(value) => handleSelectChange('deletionTime', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Deletion Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No deletion</SelectItem>
            <SelectItem value="10">10 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="1440">1 day</SelectItem>
            <SelectItem value="43200">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quotaMB">Quota (MB)</Label>
        <Input
          id="quotaMB"
          name="quotaMB"
          type="number"
          value={formData.quotaMB}
          onChange={handleInputChange}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating User...' : 'Create User'}
      </Button>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Creation</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
