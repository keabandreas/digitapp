import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

interface FormData {
  username: string
  firstName: string
  lastName: string
  userType: string
  department: string
  company: string
  responsibleFirstName: string
  responsibleLastName: string
  deletionTime: string
}

interface SftpUserCreationFormProps {
  onUserCreated: () => void
}

export default function SftpUserCreationForm({ onUserCreated }: SftpUserCreationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    firstName: '',
    lastName: '',
    userType: '',
    department: '',
    company: '',
    responsibleFirstName: '',
    responsibleLastName: '',
    deletionTime: '',
  })

  const [message, setMessage] = useState<string>('')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

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
    setIsError(false)
    setErrorDetails('')

    const userData = {
      username: formData.username,
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
    }

    try {
      const response = await fetch('/api/create_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create user')
      }

      setMessage(data.message || 'User created successfully')
      setIsError(false)
      setIsAlertOpen(true)
      onUserCreated()

      // Clear form on success
      setFormData({
        username: '',
        firstName: '',
        lastName: '',
        userType: '',
        department: '',
        company: '',
        responsibleFirstName: '',
        responsibleLastName: '',
        deletionTime: '',
      })
    } catch (error) {
      console.error('Error creating user:', error)
      setIsError(true)
      setMessage('Failed to create user')
      setErrorDetails((error as Error).message)
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
          value={formData.userType}
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
          value={formData.department}
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
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibleFirstName">Responsible First Name</Label>
            <Input
              id="responsibleFirstName"
              name="responsibleFirstName"
              value={formData.responsibleFirstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibleLastName">Responsible Last Name</Label>
            <Input
              id="responsibleLastName"
              name="responsibleLastName"
              value={formData.responsibleLastName}
              onChange={handleInputChange}
              required
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="deletionTime">Deletion Time</Label>
        <Select
          name="deletionTime"
          value={formData.deletionTime}
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating User...' : 'Create User'}
      </Button>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isError ? 'Error' : 'Success'}</AlertDialogTitle>
            <AlertDialogDescription>
              {message}
              {errorDetails && (
                <div className="mt-2 text-sm text-red-600">
                  Details: {errorDetails}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
