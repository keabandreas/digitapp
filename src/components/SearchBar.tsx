import React, { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import Fuse from 'fuse.js'

interface Document {
  id: number
  title: string
  content: string
  restricted: boolean
  category: string
}

interface SearchBarProps {
  documents: Document[]
  onSelectDocument: (id: number) => void
  isUnlocked: boolean
}

export default function SearchBar({ documents, onSelectDocument, isUnlocked }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Fuse.FuseResult<Document>[]>([])
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fuse = new Fuse(documents, {
      keys: ['title', 'content'],
      includeMatches: true,
      threshold: 0.4,
    })

    const results = fuse.search(searchTerm)
    setSearchResults(results)
  }, [searchTerm, documents])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchTerm('')
        setPreviewDocument(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleResultHover = (document: Document) => {
    setPreviewDocument(document)
  }

  const handleResultClick = (id: number) => {
    onSelectDocument(id)
    setSearchTerm('')
    setPreviewDocument(null)
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search documents..."
          className="w-full px-4 py-2 border rounded-md pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      {searchTerm && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-md shadow-lg max-h-96 overflow-auto">
          {searchResults.map((result) => (
            <div
              key={result.item.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onMouseEnter={() => handleResultHover(result.item)}
              onClick={() => handleResultClick(result.item.id)}
            >
              <h3 className="font-semibold">{result.item.title}</h3>
              <p className="text-sm text-gray-600 truncate">{result.item.content}</p>
            </div>
          ))}
        </div>
      )}
      {previewDocument && (
        <div className="absolute z-20 w-64 p-4 mt-2 bg-white border rounded-md shadow-lg right-0">
          <h3 className="font-semibold mb-2">{previewDocument.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{previewDocument.content}</p>
        </div>
      )}
    </div>
  )
}
