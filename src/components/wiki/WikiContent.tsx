// src/components/wiki/WikiContent.tsx
import dynamic from 'next/dynamic';
import { useWiki } from '@/lib/context/WikiContext';
import WikiDocument from '@/components/wiki/WikiDocument';
import WelcomeScreen from './WikiWelcome';

const MarkdownEditor = dynamic(() => import('@/components/wiki/MarkdownEditor'), {
  ssr: false
});

export function WikiContent() {
  const {
    selectedDocument,
    isEditing,
    isUnlocked,
    updateDocument,
    setIsEditing,
  } = useWiki();

  if (!selectedDocument) {
    return <WelcomeScreen />;
  }

  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        <MarkdownEditor
          documentId={selectedDocument.id}
          initialTitle={selectedDocument.title}
          initialContent={selectedDocument.content}
          onSave={async (title, content) => {
            await updateDocument(selectedDocument.id, title, content);
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
        onDocumentUpdate={updateDocument}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}