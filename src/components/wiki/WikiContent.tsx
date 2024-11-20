// src/components/wiki/WikiContent.tsx
import dynamic from 'next/dynamic';
import { useWiki } from '@/lib/context/WikiContext';
import WikiDocument from '@/components/wiki/WikiDocument';
import WelcomeScreen from './WikiWelcome';
import { Suspense } from 'react';

// Change the dynamic import to include a longer timeout and error boundary
const MarkdownEditor = dynamic(
  () => import('@/components/wiki/MarkdownEditor').catch(err => {
    console.error('Failed to load MarkdownEditor:', err);
    // Return a fallback component
    return () => (
      <div className="p-4 text-red-500">
        Failed to load editor. Please refresh the page and try again.
      </div>
    );
  }),
  {
    loading: () => <div className="p-4">Loading editor...</div>,
    ssr: false,
    timeout: 10000  // Increase timeout to 10 seconds
  }
);

export function WikiContent() {
  const {
    selectedDocument,
    isEditing,
    isUnlocked,
    updateDocument,
    setIsEditing,
  } = useWiki();

  console.log('WikiContent rendered:', {
    selectedDocumentId: selectedDocument?.id,
    isEditing
  });

  if (!selectedDocument) {
    return <WelcomeScreen />;
  }

  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        <Suspense fallback={<div className="p-4">Loading editor...</div>}>
          <MarkdownEditor
            documentId={selectedDocument.id}
            initialTitle={selectedDocument.title}
            initialContent={selectedDocument.content}
            onSave={async (title, content) => {
              await updateDocument(selectedDocument.id, { title, content });
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </Suspense>
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