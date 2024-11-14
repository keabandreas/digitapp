import { useState } from 'react';
import { useWiki } from '@/lib/context/WikiContext';
import { WikiHeader } from '@/components/wiki/WikiHeader';
import WikiDocumentList from '@/components/wiki/WikiDocumentList';
import { WikiContent } from '@/components/wiki/WikiContent';
import { WikiDialogs } from '@/components/wiki/WikiDialogs';

export default function WikiPage() {
  // Local state for dialogs
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get everything else from context
  const {
    documents,
    selectedDocument,
    categories,
    tags,
    isEditing,
    isUnlocked,
    isLoading,
    isPasswordPromptOpen,
    setIsPasswordPromptOpen,
    setIsEditing,
    selectDocument,
    updateDocument,
    deleteDocument,
    createDocument,
    setIsUnlocked,
    handlePasswordSubmit
  } = useWiki();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        searchResults={[]} // You might want to handle search results properly
        categories={categories}
        documents={documents}
        onPasswordSubmit={handlePasswordSubmit}
        onCreateDocument={createDocument}
        onDocumentSelect={selectDocument}
        onSearch={() => {}} // Implement search handling
        setIsPasswordPromptOpen={setIsPasswordPromptOpen}
        setIsAddDocumentOpen={setIsAddDocumentOpen}
        setIsUploadDialogOpen={setIsUploadDialogOpen}
        setIsSearchOpen={setIsSearchOpen}
        setSearchResults={() => {}} // Implement search results handling
        setSelectedDocument={selectDocument}
        setExpandedCategories={() => {}} // Implement category expansion handling
      />
    </div>
  );

  // Helper functions
  function handleDocumentSelect(id: number) {
    selectDocument(id);
    setIsEditing(false);
  }

  function handleUnlockToggle(checked: boolean) {
    if (checked && !isUnlocked) {
      setIsPasswordPromptOpen(true);
    } else if (!checked && isUnlocked) {
      setIsUnlocked(false);
    }
  }

  function canEditDocument(document: any) {
    return isUnlocked || !document.restricted;
  }
}