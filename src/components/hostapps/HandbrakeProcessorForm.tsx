import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

interface HandbrakeProcessorFormProps {
  password: string
  onProcessingStart: (file: File, preset: number) => void
  onCancel: () => void
  presets: Array<{ name: string; path: string | null }>
}

const formSchema = z.object({
  file: z.string().min(1, "Please select a file"),
  preset: z.string().min(1, "Please select a preset")
})

type FormValues = z.infer<typeof formSchema>

export function HandbrakeProcessorForm({ 
  password, 
  onProcessingStart,
  onCancel,
  presets 
}: HandbrakeProcessorFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: "",
      preset: "0"
    }
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedFile(file)
      form.setValue('file', file.name)
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!selectedFile) {
      toast.error("Please select a file")
      return
    }
  
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('password', password)
  
      onProcessingStart(selectedFile, parseInt(values.preset))
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Select File</Label>
          <Input 
            type="file" 
            onChange={handleFileSelect}
          />
        </div>

        <FormField
          control={form.control}
          name="preset"
          render={({ field }) => (
            <FormItem>
              <Label>Select Preset</Label>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Start Processing
          </Button>
        </div>
      </form>
    </Form>
  )
}