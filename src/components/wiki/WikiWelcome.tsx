import React from 'react';
import { Card } from "@/components/ui/card";
import { Pin, Clock, Tag, FolderOpen } from "lucide-react";
import { useWiki } from '@/lib/context/WikiContext';
import { formatDistanceToNow } from 'date-fns';

export default function WelcomeScreen() {
  const { documents, selectDocument } = useWiki();

  const pinnedDocs = documents.filter(doc => doc.isPinned);
  const recentDocs = documents
    .filter(doc => !doc.isPinned)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Calculate statistics
  const totalDocs = documents.length;
  const publicDocs = documents.filter(doc => !doc.restricted).length;
  const categories = [...new Set(documents.map(doc => doc.category))];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Wiki</h1>
        <p className="text-xl text-muted-foreground">
          Your central hub for documentation and knowledge sharing
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-primary/10 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-primary mb-2">{totalDocs}</h3>
          <p className="text-sm text-muted-foreground">Total Documents</p>
        </div>
        <div className="bg-secondary/10 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-secondary mb-2">{categories.length}</h3>
          <p className="text-sm text-muted-foreground">Categories</p>
        </div>
        <div className="bg-accent/10 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-accent mb-2">{publicDocs}</h3>
          <p className="text-sm text-muted-foreground">Public Documents</p>
        </div>
      </div>

      {pinnedDocs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Pin className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Pinned Documents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedDocs.map(doc => (
              <Card
                key={doc.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => selectDocument(doc.id)}
              >
                <h3 className="font-medium mb-2">{doc.title}</h3>
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  {doc.category}
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    {doc.tags.map(tag => tag.name).join(', ')}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Recently Updated</h2>
        </div>
        <div className="space-y-2">
          {recentDocs.map(doc => (
            <div
              key={doc.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => selectDocument(doc.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">{doc.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  {doc.category}
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {doc.tags.map(tag => tag.name).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}