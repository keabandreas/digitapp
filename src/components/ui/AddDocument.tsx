import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface AddDocumentProps {
  categories: string[]
  onCreateDocument: (title: string, category: string, restricted: boolean) => Promise<void>
  initialCategory?: string
  onClose?: () => void
}

export default function AddDocument({ categories, onCreateDocument, initialCategory = "", onClose }: AddDocumentProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState(initialCategory)
  const [restricted, setRestricted] = useState(false)

  useEffect(() => {
    setCategory(initialCategory)
  }, [initialCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCreateDocument(title, category, restricted)
    setTitle("")
    setCategory("")
    setRestricted(false)
    if (onClose) onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="restricted"
          checked={restricted}
          onCheckedChange={setRestricted}
        />
        <Label htmlFor="restricted">Restricted</Label>
      </div>
      <Button type="submit">Create Document</Button>
    </form>
  )
}
