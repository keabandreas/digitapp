// src/components/wiki/WikiDocumentList.tsx
import { useWiki } from '@/lib/context/WikiContext';
import { Button } from "@/components/ui/button";
import { IconFileText, IconLock, IconEdit, IconTrash } from '@tabler/icons-react';

export default function WikiDocumentList() {
  const { 
    documents,
    selectedDocument,
    isUnlocked,
    selectDocument,
    deleteDocument,
    setIsEditing,
    isLoading
  } = useWiki();

  if (isLoading) {
    return (
      <div className="p-4 text-center">Loading documents...</div>
    );
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  return (
    <div className="h-full overflow-auto">
      <div className="p-4">
        {Object.entries(groupedDocuments).map(([category, docs]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{category}</h2>
            <div className="space-y-2">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className={`
                    border rounded-md overflow-hidden shadow-sm
                    ${doc.restricted && !isUnlocked ? 'opacity-50' : ''}
                    ${selectedDocument?.id === doc.id ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-between p-2
                      ${doc.restricted && !isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/20'}
                    `}
                    onClick={() => {
                      if (!(doc.restricted && !isUnlocked)) {
                        selectDocument(doc.id);
                      }
                    }}
                  >
                    <span className={doc.restricted && !isUnlocked ? 'text-muted-foreground' : 'text-foreground'}>
                      {doc.title}
                    </span>
                    <div className="flex items-center space-x-2">
                      {doc.restricted && (
                        <IconLock size={16} className="text-orange" />
                      )}
                      {(!doc.restricted || isUnlocked) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectDocument(doc.id);
                              setIsEditing(true);
                            }}
                          >
                            <IconEdit size={16} />
                            <span className="sr-only">Edit</span>
                          </Button>
                          {isUnlocked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDocument(doc.id);
                              }}
                            >
                              <IconTrash size={16} />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}