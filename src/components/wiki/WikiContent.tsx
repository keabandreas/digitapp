// @/components/wiki/WikiContent.tsx
// Handles document display and editing
import dynamic from 'next/dynamic';
import { Document } from '@/lib/types/wiki';
import WikiDocument from '@/components/wiki/WikiDocument';

const MarkdownEditor = dynamic(() => import('@/components/wiki/MarkdownEditor'), {
  ssr: false
});

interface WikiContentProps {
  selectedDocument: Document | null;
  isEditing: boolean;
  isUnlocked: boolean;
  onUpdateDocument: (id: number, title: string, content: string) => Promise<void>;
  setIsEditing: (value: boolean) => void;
}

export function WikiContent({
  selectedDocument,
  isEditing,
  isUnlocked,
  onUpdateDocument,
  setIsEditing
}: WikiContentProps) {
  if (!selectedDocument) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a document to view its content
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        <MarkdownEditor
          documentId={selectedDocument.id}
          initialTitle={selectedDocument.title}
          initialContent={selectedDocument.content}
          onSave={(title, content) => {
            onUpdateDocument(selectedDocument.id, title, content);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <WikiDocument
        document={selectedDocument}
        isUnlocked={isUnlocked}
        onDocumentUpdate={onUpdateDocument}
      />
    </div>
  );
}