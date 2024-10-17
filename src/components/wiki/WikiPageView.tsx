import React, { useState } from 'react';
import { useWikiContext } from './WikiContext';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Eye, Edit, Trash2, X } from "lucide-react";
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';

export const WikiPageView: React.FC = () => {
  const { selectedPage, isLocked, handleSavePage, handleDeletePage, setSelectedPage } = useWikiContext();
  const [isEditing, setIsEditing] = useState(false);

  if (!selectedPage) return null;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{selectedPage.title}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Page Options</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {isEditing ? 'View' : 'Edit'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeletePage(selectedPage.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedPage(null)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isEditing ? (
        <MarkdownEditor
          initialValue={selectedPage.content}
          onSave={(content) => handleSavePage({ ...selectedPage, content })}
          isLocked={isLocked}
          isRestricted={selectedPage.isRestricted}
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <MarkdownPreview content={selectedPage.content} isRestricted={selectedPage.isRestricted} />
      )}
    </>
  );
};
