import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Eye, Save, Lock, Trash2, X } from "lucide-react";

interface MarkdownEditorProps {
  initialValue: string;
  onSave: (content: string, restrictedSections: { start: number; end: number }[]) => void;
  isLocked: boolean;
  restrictedSections?: { start: number; end: number }[];
  onDelete: () => void;
  onClose: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onSave,
  isLocked,
  restrictedSections = [],
  onDelete,
  onClose,
}) => {
  const [content, setContent] = useState(initialValue);
  const [sections, setSections] = useState(restrictedSections);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    onSave(content, sections);
  };

  const handleMakeSecret = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        setSections([...sections, { start, end }]);
        const newContent = 
          content.slice(0, start) +
          `[RESTRICTED]${content.slice(start, end)}[/RESTRICTED]` +
          content.slice(end);
        setContent(newContent);
      }
    }
  };

  const renderPageContent = (content: string, restrictedSections?: { start: number; end: number }[]): string => {
    if (!restrictedSections || restrictedSections.length === 0) {
      return content;
    }

    let result = '';
    let lastIndex = 0;

    restrictedSections.forEach(({ start, end }) => {
      result += content.slice(lastIndex, start);
      const restrictedContent = content.slice(start, end);
      result += isLocked
        ? `<div class="bg-gray-300 text-gray-300 select-none" aria-hidden="true">${'X'.repeat(restrictedContent.length)}</div>`
        : `<span class="bg-yellow-200">${restrictedContent}</span>`;
      lastIndex = end;
    });

    result += content.slice(lastIndex);

    return result;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Edit Options</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsPreview(!isPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {isPreview ? 'Edit' : 'Preview'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMakeSecret}>
              <Lock className="mr-2 h-4 w-4" />
              Make Secret
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isPreview ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderPageContent(content, sections) }} />
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          className="w-full min-h-[300px] p-2 border rounded"
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
