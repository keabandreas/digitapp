import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'

interface FileUploadProps {
  onFileProcessed: (data: {
    title: string,
    content: string,
    category: string,
    restricted: boolean
  }) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [restricted, setRestricted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0]
        setFile(uploadedFile)
        setTitle(uploadedFile.name.replace(/\.[^/.]+$/, "")) // Remove file extension
      }
    },
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    }
  })

  const handleUpload = async () => {
    if (!file) return

    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/convert-docx', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      
      onFileProcessed({
        title,
        content: data.content,
        category,
        restricted
      })

      toast.success('File uploaded and converted successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
        <input {...getInputProps()} />
        <p>{file ? file.name : "Drag 'n' drop a Word file here, or click to select one"}</p>
      </div>
      {file && (
        <>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Systems">Systems</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="restricted" checked={restricted} onCheckedChange={setRestricted} />
            <Label htmlFor="restricted">Restricted</Label>
          </div>
          <Button onClick={handleUpload} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Upload and Process'}
          </Button>
        </>
      )}
    </div>
  )
}
