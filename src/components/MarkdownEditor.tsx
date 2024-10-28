import React, { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import 'easymde/dist/easymde.min.css'

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

interface MarkdownEditorProps {
  documentId: number
  initialTitle: string
  initialContent: string
  onSave: (title: string, content: string) => void
  onCancel: () => void
}

export default function MarkdownEditor({ documentId, initialTitle, initialContent, onSave, onCancel }: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setTitle(initialTitle)
    setContent(initialContent)
  }, [initialTitle, initialContent])

  const handleSave = useCallback(() => {
    onSave(title, content)
  }, [title, content, onSave])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }, [])

  const handleContentChange = useCallback((value: string) => {
    setContent(value)
  }, [])

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    status: false,
    minHeight: '400px',
    autofocus: true,
    autosave: {
      enabled: true,
      uniqueId: `document-${documentId}`,
      delay: 1000,
    },
  }), [documentId])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Document Title"
          className="text-xl font-bold mb-2"
        />
      </div>
      <SimpleMDE
        value={content}
        onChange={handleContentChange}
        options={editorOptions}
      />
      <div className="p-4 border-t flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}
