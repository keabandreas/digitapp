import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form"
import { toast } from "sonner"

interface PasswordPromptProps {
  isOpen: boolean
  onPasswordSubmit: (password: string) => void
  onClose: () => void
}

const formSchema = z.object({
  password: z.string().min(1, "Password is required")
})

type FormValues = z.infer<typeof formSchema>

export function PasswordPrompt({ isOpen, onPasswordSubmit, onClose }: PasswordPromptProps) {
  const [isValidating, setIsValidating] = useState(false)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: ""
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setIsValidating(true)

      const response = await fetch('/api/hostapps/handbrake?action=list_files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          password: values.password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503 || response.status === 502) {
          throw new Error('Server is currently unavailable. Please try again later.');
        }
        throw new Error(data.error || data.details || 'Invalid password');
      }

      // If we got here, the password is valid
      onPasswordSubmit(values.password);
      form.reset();
    } catch (error) {
      console.error('Password validation error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to validate password. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  }

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter SFTP Password</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="password">Password</Label>
                  <FormControl>
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="Enter SFTP password"
                      {...field}
                      autoComplete="off"
                      disabled={isValidating}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isValidating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isValidating}
              >
                {isValidating ? "Validating..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
