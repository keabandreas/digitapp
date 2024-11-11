// @/components/wiki/WikiDialogs.tsx
// Manages all modal/dialog interactions
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PasswordPromptModal } from '@/components/wiki/PasswordPromptModal';
import AddDocument from '@/components/wiki/AddDocument';
import { FileUpload } from '@/components/wiki/FileUpload';
import WikiSearchModal from '@/components/wiki/WikiSearchModal';
import { Document } from '@/lib/types/wiki';

interface WikiDialogsProps {
  isPasswordPromptOpen: boolean;
  isAddDocumentOpen: boolean;
  isUploadDialogOpen: boolean;
  isSearchOpen: boolean;
  searchResults: any[];
  categories: string[];
  documents: Document[];
  onPasswordSubmit: (password: string) => Promise<void>;
  onCreateDocument: (title: string, category: string, restricted: boolean, content: string) => Promise<void>;
  onDocumentSelect: (id: number) => void;
  onSearch: (query: string) => void;
  setIsPasswordPromptOpen: (value: boolean) => void;
  setIsAddDocumentOpen: (value: boolean) => void;
  setIsUploadDialogOpen: (value: boolean) => void;
  setIsSearchOpen: (value: boolean) => void;
  setSearchResults: (results: any[]) => void;
  setSelectedDocument: (doc: Document | null) => void;
  setExpandedCategories: (categories: { [key: string]: boolean }) => void;
}

export function WikiDialogs({
  isPasswordPromptOpen,
  isAddDocumentOpen,
  isUploadDialogOpen,
  isSearchOpen,
  searchResults,
  categories,
  documents,
  onPasswordSubmit,
  onCreateDocument,
  onDocumentSelect,
  onSearch,
  setIsPasswordPromptOpen,
  setIsAddDocumentOpen,
  setIsUploadDialogOpen,
  setIsSearchOpen,
  setSearchResults,
  setSelectedDocument,
  setExpandedCategories
}: WikiDialogsProps) {
  return (
    <>
      <PasswordPromptModal
        isOpen={isPasswordPromptOpen}
        onClose={() => setIsPasswordPromptOpen(false)}
        onSubmit={onPasswordSubmit}
      />

      <WikiSearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchResults([]);
        }}
        searchResults={searchResults}
        onResultSelect={onDocumentSelect}
        expandToDocument={(id) => {
          const document = documents.find(doc => doc.id === id);
          if (document) {
            setExpandedCategories(prev => ({
              ...prev,
              [document.category]: true
            }));
          }
        }}
        onSearch={onSearch}
      />

      <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
          </DialogHeader>
          <AddDocument
            categories={categories}
            onCreateDocument={async (title, category, restricted, content) => {
              await onCreateDocument(title, category, restricted, content);
              setIsAddDocumentOpen(false);
            }}
            onClose={() => setIsAddDocumentOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Word Document</DialogTitle>
          </DialogHeader>
          <FileUpload
            onFileProcessed={async (data) => {
              await onCreateDocument(
                data.title,
                data.category,
                data.restricted,
                data.content
              );
              setIsUploadDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}