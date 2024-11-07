import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { IconFileText, IconServer, IconDeviceDesktop, IconChevronDown, IconChevronRight, IconKey, IconEdit, IconTrash } from '@tabler/icons-react'

interface Document {
  id: number
  title: string
  content: string
  restricted: boolean
  category: string
}

interface WikiDocumentListProps {
  documents: Document[]
  onDocumentSelect: (id: number) => void
  onEditDocument: (id: number) => void
  onDeleteDocument: (id: number) => void
  isUnlocked: boolean
  onDocumentsChange: () => void
  selectedDocumentId: number | null
  canEditDocument: (document: Document) => boolean
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  "General": <IconFileText size={20} className="text-green transition-colors" />,
  "IT": <IconDeviceDesktop size={20} className="text-orange transition-colors" />,
  "Systems": <IconServer size={20} className="text-purple transition-colors" />,
}

export default function WikiDocumentList({
  documents,
  onDocumentSelect,
  onEditDocument,
  onDeleteDocument,
  isUnlocked,
  onDocumentsChange,
  selectedDocumentId,
  canEditDocument
}: WikiDocumentListProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const allCategories = [...new Set(documents.map(doc => doc.category))].sort()
    setCategories(allCategories)
    setExpandedCategories(prevExpanded => {
      const newExpanded = { ...prevExpanded }
      allCategories.forEach(category => {
        if (!(category in newExpanded)) {
          newExpanded[category] = false
        }
      })
      return newExpanded
    })
    setIsLoading(false)
  }, [documents])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const handleDeleteDocument = async (id: number) => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/wiki?id=${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        onDeleteDocument(id)
        onDocumentsChange()
      } else {
        console.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        {isLoading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category}>
                <Card
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                <CardContent className="flex items-center justify-between p-2">
                  <div className="flex items-center">
                    {expandedCategories[category] ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                    <span className="font-medium ml-2">{category}</span>
                  </div>
                  <span>
                    {categoryIcons[category] || <IconFileText size={20} className="text-primary" />}
                  </span>
                </CardContent>
                </Card>
                {expandedCategories[category] && (
                  <ul className="space-y-2 mt-2 ml-6">
                    {documents.filter(doc => doc.category === category).map((doc) => (
                      <li
                        key={doc.id}
                        className={`border rounded-md overflow-hidden shadow-sm ${
                          doc.restricted && !isUnlocked ? 'opacity-50' : ''
                        } ${selectedDocumentId === doc.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div
                          className={`flex items-center justify-between p-2 ${
                            doc.restricted && !isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            if (!(doc.restricted && !isUnlocked)) {
                              onDocumentSelect(doc.id)
                            }
                          }}
                        >
                          <span className={`${
                            doc.restricted && !isUnlocked ? 'text-gray-500' : 'text-blue-500'
                          }`}>
                            {doc.title}
                          </span>
                          <div className="flex items-center space-x-2">
                            {doc.restricted && (
                              <IconKey size={16} className="text-yellow-500" />
                            )}
                            {canEditDocument(doc) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEditDocument(doc.id)
                                  }}
                                >
                                  <IconEdit size={16} />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                {isUnlocked && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                        }}
                                      >
                                        <IconTrash size={16} />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the document
                                          "{doc.title}" and remove it from our servers.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteDocument(doc.id)} disabled={isDeleting}>
                                          {isDeleting ? 'Deleting...' : 'Delete'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
