// @/pages/wiki.tsx
import { useState, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { WikiHeader } from '@/components/wiki/WikiHeader';
import WikiDocumentList from '@/components/wiki/WikiDocumentList';
import { WikiContent } from '@/components/wiki/WikiContent';
import { WikiDialogs } from '@/components/wiki/WikiDialogs';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSearch } from '@/lib/hooks/useSearch';
import { Document } from '@/lib/types/wiki';

export default function WikiPage() {
  const {
    documents,
    categories,
    isLoading,
    createDocument,
    updateDocument,
    deleteDocument
  } = useDocuments();

  const {
    isUnlocked,
    isPasswordPromptOpen,
    setIsPasswordPromptOpen,
    handleUnlockToggle,
    handlePasswordSubmit
  } = useAuth();

  const {
    isSearchOpen,
    setIsSearchOpen,
    searchResults,
    setSearchResults,
    handleSearch
  } = useSearch(documents);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  useHotkeys('ctrl+space', (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  }, []);

  const handleDocumentSelect = useCallback((id: number) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      setSelectedDocument(document);
      setIsEditing(false);
    }
  }, [documents]);

  const canEditDocument = useCallback((document: Document) => {
    return isUnlocked || !document.restricted;
  }, [isUnlocked]);

  return (
    <div className="flex flex-col h-screen w-full bg-base-300 text-foreground">
      <WikiHeader
        isUnlocked={isUnlocked}
        onUnlockToggle={handleUnlockToggle}
        onAddDocument={() => setIsAddDocumentOpen(true)}
        onUploadDocument={() => setIsUploadDialogOpen(true)}
      />

      <div className="flex-1 overflow-hidden flex">
        <div className="w-1/4 border-r overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center">Loading documents...</div>
          ) : (
            <WikiDocumentList
              documents={documents}
              onDocumentSelect={handleDocumentSelect}
              onEditDocument={(id) => {
                handleDocumentSelect(id);
                setIsEditing(true);
              }}
              onDeleteDocument={deleteDocument}
              isUnlocked={isUnlocked}
              selectedDocumentId={selectedDocument?.id}
              canEditDocument={canEditDocument}
              expandedCategories={expandedCategories}
              setExpandedCategories={setExpandedCategories}
            />
          )}
        </div>

        <div className="w-3/4 overflow-auto flex flex-col">
          <WikiContent
            selectedDocument={selectedDocument}
            isEditing={isEditing}
            isUnlocked={isUnlocked}
            onUpdateDocument={updateDocument}
            setIsEditing={setIsEditing}
          />
        </div>
      </div>

      <WikiDialogs
        isPasswordPromptOpen={isPasswordPromptOpen}
        isAddDocumentOpen={isAddDocumentOpen}
        isUploadDialogOpen={isUploadDialogOpen}
        isSearchOpen={isSearchOpen}
        searchResults={searchResults}
        categories={categories}
        documents={documents}
        onPasswordSubmit={handlePasswordSubmit}
        onCreateDocument={createDocument}
        onDocumentSelect={handleDocumentSelect}
        onSearch={handleSearch}
        setIsPasswordPromptOpen={setIsPasswordPromptOpen}
        setIsAddDocumentOpen={setIsAddDocumentOpen}
        setIsUploadDialogOpen={setIsUploadDialogOpen}
        setIsSearchOpen={setIsSearchOpen}
        setSearchResults={setSearchResults}
        setSelectedDocument={setSelectedDocument}
        setExpandedCategories={setExpandedCategories}
      />
    </div>
  );
}