import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MarkdownEditorProps {
  initialValue: string;
  onSave: (content: string) => void;
  isLocked: boolean;
  secretSections?: { start: number; end: number }[];
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialValue, onSave, isLocked, secretSections = [] }) => {
  const [content, setContent] = useState(initialValue);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(content);
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  const renderContent = () => {
    if (isLocked) {
      const lines = content.split('\n');
      const redactedLines = lines.map((line, index)   => {
        if (secretSections.some(section => index >= section.start && index <= section.end)) {
          return '[REDACTED]';
        }
        return line;
      });
      return redactedLines.join('\n');
    }
    return content;
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="border p-4 rounded-md">
          <ReactMarkdown>{renderContent()}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full"
        />
      )}
      <div className="flex justify-between">
        <Button onClick={togglePreview}>
          {preview ? 'Edit' : 'Preview'}
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};

export default MarkdownEditor;
