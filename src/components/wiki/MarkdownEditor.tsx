import React, { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import debounce from 'lodash/debounce';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { 
  ssr: false,
  loading: () => <div className="p-4">Loading editor...</div>
});

interface MarkdownEditorProps {
  documentId: number;
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}

export default function MarkdownEditor({
  documentId,
  initialTitle,
  initialContent,
  onSave,
  onCancel
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  // Memoize editor options for better performance
  const options = useMemo(() => ({
    spellChecker: false,
    status: false,
    minHeight: '400px',
    maxHeight: '600px',
    autofocus: true,
    renderingConfig: {
      singleLineBreaks: false,
      codeSyntaxHighlighting: true,
    },
    previewImagesInEditor: false, // Disable image preview in editor
    sideBySideFullscreen: false,
    hideIcons: ['image', 'side-by-side', 'fullscreen'],
    showIcons: ['bold', 'italic', 'heading', 'code', 'quote', 'unordered-list', 'ordered-list', 'link'],
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'code', '|',
      'unordered-list', 'ordered-list', '|',
      'link',
      {
        name: 'custom-image',
        action: function customFunction(editor) {
          const cm = editor.codemirror;
          const url = prompt('Enter image URL (recommended max size: 1MB):');
          if (url) {
            const text = `![](${url})`;
            cm.replaceSelection(text);
          }
        },
        className: 'fa fa-picture-o',
        title: 'Add Image',
      }
    ],
  }), []);

  // Debounced content update
  const debouncedSetContent = useCallback(
    debounce((value: string) => {
      setContent(value);
    }, 150),
    []
  );

  // Handle content change
  const handleContentChange = useCallback((value: string) => {
    debouncedSetContent(value);
  }, [debouncedSetContent]);

  // Handle save
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(title, content);
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSetContent.cancel();
    };
  }, [debouncedSetContent]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        await handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, onCancel]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document Title"
          className="text-xl font-bold"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <SimpleMDE
          value={content}
          onChange={handleContentChange}
          options={options}
        />
      </div>

      <div className="p-4 border-t flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Press Ctrl + S to save
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}