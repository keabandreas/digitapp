import { useState, useEffect, useCallback } from 'react'
import WikiDocumentList from '@/components/WikiDocumentList'
import WikiDocument from '@/components/WikiDocument'
import dynamic from 'next/dynamic'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PasswordPromptModal } from '@/components/PasswordPromptModal'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AddDocument from '@/components/ui/AddDocument'
import { FileUpload } from '@/components/ui/FileUpload'
import { toast } from 'react-hot-toast'

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), { ssr: false })

interface Document {
  id: number
  title: string
  content: string
  restricted: boolean
  category: string
}

export default function WikiPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false)
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch('/api/wiki')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
        const allCategories = [...new Set(data.map((doc: Document) => doc.category))].sort()
        setCategories(allCategories)
      } else {
        console.error('Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDocumentSelect = useCallback(async (id: number) => {
    const document = documents.find(doc => doc.id === id)
    if (document) {
      setSelectedDocument(document)
      setIsEditing(false)
    }
  }, [documents])

  const handleDocumentUpdate = useCallback(async (id: number, title: string, content: string) => {
    try {
      const response = await fetch('/api/wiki', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, content }),
      })
      if (response.ok) {
        const updatedDoc = await response.json()
        setDocuments(prevDocs => prevDocs.map(doc => doc.id === id ? updatedDoc : doc))
        setSelectedDocument(updatedDoc)
      } else {
        console.error('Failed to update document')
      }
    } catch (error) {
      console.error('Error updating document:', error)
    }
  }, [])

  const handleUnlockToggle = useCallback((checked: boolean) => {
    if (checked && !isUnlocked) {
      setIsPasswordPromptOpen(true)
    } else if (!checked && isUnlocked) {
      setIsUnlocked(false)
    }
  }, [isUnlocked])

  const handlePasswordSubmit = useCallback(async (password: string) => {
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsUnlocked(true)
        setIsPasswordPromptOpen(false)
      } else {
        alert('Incorrect password')
      }
    } catch (error) {
      console.error('Error during authentication:', error)
    }
  }, [])

  const handleCreateDocument = useCallback(async (title: string, category: string, restricted: boolean, content: string = '') => {
    try {
      const response = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, restricted, content }),
      })
      if (response.ok) {
        const newDocument = await response.json()
        await fetchDocuments()
        setIsAddDocumentOpen(false)
        setSelectedDocument(newDocument)
        toast.success('Document created successfully')
      } else {
        console.error('Failed to create document')
        toast.error('Failed to create document')
      }
    } catch (error) {
      console.error('Error creating document:', error)
      toast.error('Error creating document')
    }
  }, [fetchDocuments])

  const handleFileProcessed = useCallback(async (data: { title: string, content: string, category: string, restricted: boolean }) => {
    try {
      const newDocument = await handleCreateDocument(data.title, data.category, data.restricted, data.content)
      setIsUploadDialogOpen(false)
      setSelectedDocument(newDocument)
      fetchDocuments()
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Error processing file')
    }
  }, [handleCreateDocument, fetchDocuments])

  const handleEditDocument = useCallback((id: number) => {
    const document = documents.find(doc => doc.id === id)
    if (document) {
      setSelectedDocument(document)
      setIsEditing(true)
    }
  }, [documents])

  const handleDeleteDocument = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/wiki/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setDocuments(docs => docs.filter(doc => doc.id !== id))
        if (selectedDocument && selectedDocument.id === id) {
          setSelectedDocument(null)
          setIsEditing(false)
        }
        toast.success('Document deleted successfully')
      } else {
        console.error('Failed to delete document')
        toast.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Error deleting document')
    }
  }, [selectedDocument])

  const canEditDocument = useCallback((document: Document) => {
    return isUnlocked || !document.restricted
  }, [isUnlocked])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  return (
    <div className="flex flex-col h-screen w-full bg-base-300 text-foreground">
      <div className="flex-shrink-0 p-4 bg-base-300 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Wiki Documents</h1>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setIsAddDocumentOpen(true)}>Add New Page</Button>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>Upload Word Document</Button>
            <div className="flex items-center space-x-2">
              <Switch
                id="lock-mode"
                checked={isUnlocked}
                onCheckedChange={handleUnlockToggle}
              />
              <Label htmlFor="lock-mode">
                {isUnlocked ? 'Unlocked' : 'Locked'}
              </Label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex">
        <div className="w-1/4 border-r overflow-auto">
          <WikiDocumentList
            documents={documents}
            onDocumentSelect={handleDocumentSelect}
            onEditDocument={handleEditDocument}
            onDeleteDocument={handleDeleteDocument}
            isUnlocked={isUnlocked}
            onDocumentsChange={fetchDocuments}
            selectedDocumentId={selectedDocument?.id}
            canEditDocument={canEditDocument}
          />
        </div>
        <div className="w-3/4 overflow-auto flex flex-col">
          {selectedDocument ? (
            <div className="flex-1 overflow-auto">
              {isEditing ? (
                <div className="h-full flex flex-col">
                  <MarkdownEditor
                    documentId={selectedDocument.id}
                    initialTitle={selectedDocument.title}
                    initialContent={selectedDocument.content}
                    onSave={(title, content) => {
                      handleDocumentUpdate(selectedDocument.id, title, content)
                      setIsEditing(false)
                    }}
                    onCancel={handleCancelEdit}
                  />
                </div>
              ) : (
                <div className="p-4">
                  <WikiDocument
                    document={selectedDocument}
                    isUnlocked={isUnlocked}
                    onDocumentUpdate={handleDocumentUpdate}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a document to view its content
            </div>
          )}
        </div>
      </div>
      <PasswordPromptModal
        isOpen={isPasswordPromptOpen}
        onClose={() => {
          setIsPasswordPromptOpen(false)
          setIsUnlocked(false)
        }}
        onSubmit={handlePasswordSubmit}
      />
      <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
          </DialogHeader>
          <AddDocument
            categories={categories}
            onCreateDocument={handleCreateDocument}
            onClose={() => setIsAddDocumentOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Word Document</DialogTitle>
          </DialogHeader>
          <FileUpload onFileProcessed={handleFileProcessed} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
