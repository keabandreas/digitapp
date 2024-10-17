import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Eye, Save, X } from "lucide-react";

interface MarkdownEditorProps {
  initialValue: string;
  onSave: (content: string) => void;
  isLocked: boolean;
  isRestricted: boolean;
  onClose: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onSave,
  isLocked,
  isRestricted,
  onClose,
}) => {
  const [content, setContent] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    onSave(content);
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
            <DropdownMenuItem onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isPreview ? (
        <div className="prose max-w-none">
          {isLocked && isRestricted ? 'This content is restricted.' : content}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={handleChange}
          className="w-full min-h-[300px] p-2 border rounded"
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
