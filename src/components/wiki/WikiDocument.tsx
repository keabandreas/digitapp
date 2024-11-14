import React from 'react';
import { toast } from 'sonner';  // Add this import
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Pin, PinOff, Lock, Pencil } from 'lucide-react';
import { Document } from '@/lib/types/wiki';
import '@uiw/react-markdown-preview/markdown.css';

interface WikiDocumentProps {
  document: Document;
  isUnlocked: boolean;
  onDocumentUpdate: (id: number, updates: Partial<Document>) => Promise<void>;
  onEdit: () => void;
}

export default function WikiDocument({ 
  document, 
  isUnlocked, 
  onDocumentUpdate,
  onEdit
}: WikiDocumentProps) {
  if (!document) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No document selected
      </div>
    );
  }

  const togglePin = async () => {
    try {
      await onDocumentUpdate(document.id, {
        isPinned: !document.isPinned
      });
      toast.success(document.isPinned ? 'Document unpinned' : 'Document pinned');
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update pin status');
    }
  };

  // Function to preprocess the Markdown content
  const preprocessMarkdown = (content: string) => {
    // Replace single line breaks with <br>, but preserve double line breaks
    return content.replace(/(?<!\n)\n(?!\n)/g, '  \n');
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const processedContent = preprocessMarkdown(document.content);
  const canEdit = isUnlocked || !document.restricted;

  return (
    <div className="w-full h-full bg-background text-foreground">
      <div className="p-6 border-b">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink>Wiki</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>{document.category}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <span className="font-medium">{document.title}</span>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{document.title}</h1>
            {document.restricted && (
              <Lock className="w-5 h-5 text-warning" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePin}
                  title={document.isPinned ? "Unpin document" : "Pin document"}
                >
                  {document.isPinned ? (
                    <PinOff className="w-4 h-4" />
                  ) : (
                    <Pin className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  title="Edit document"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {document.tags.map(tag => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{
                  borderColor: tag.color,
                  color: tag.color,
                  backgroundColor: `${tag.color}10`
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4">
          Last updated: {formatDate(document.updatedAt)}
        </div>
      </div>

      <div className="p-6 prose dark:prose-invert max-w-none">
        <MarkdownPreview 
          source={processedContent} 
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          }}
        />
      </div>
    </div>
  );
}