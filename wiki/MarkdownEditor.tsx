"use client"

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MarkdownEditorProps {
  initialValue: string;
  onSave: (content: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialValue, onSave }) => {
  const [content, setContent] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="space-y-4">
      {isPreview ? (
        <div className="prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full font-mono"
        />
      )}
      <div className="flex justify-between">
        <Button onClick={() => setIsPreview(!isPreview)}>
          {isPreview ? 'Edit' : 'Preview'}
        </Button>
        <Button onClick={() => onSave(content)}>Save</Button>
      </div>
    </div>
  );
};

export default MarkdownEditor;
