import React, { Suspense, lazy } from 'react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Lock, Pencil } from 'lucide-react';
import { Document } from '@/lib/types/wiki';

// Lazy load the markdown preview component
const MarkdownPreview = lazy(() => import('@uiw/react-markdown-preview'));

interface WikiDocumentProps {
  document: Document;
  isUnlocked: boolean;
  onDocumentUpdate: (id: number, updates: Partial<Document>) => Promise<void>;
  onEdit: () => void;
}

// Loading placeholder for markdown content
const MarkdownLoading = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = isUnlocked || !document.restricted;

  return (
    <div className="w-full h-full bg-base-200 text-foreground">
      {/* Header section */}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                title="Edit document"
              >
                <Pencil className="w-4 h-4" />
              </Button>
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

      {/* Content section with lazy loading */}
      <div className="p-6 prose dark:prose-invert max-w-none">
        <Suspense fallback={<MarkdownLoading />}>
          <MarkdownPreview 
            source={document.content} 
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
            rehypePlugins={[]}
            remarkPlugins={[]}
          />
        </Suspense>
      </div>
    </div>
  );
}