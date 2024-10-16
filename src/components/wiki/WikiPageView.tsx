import React, { useState } from 'react';
import { useWikiContext } from './WikiContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Eye, Edit, Trash2, X } from "lucide-react";
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), { ssr: false });
const MarkdownPreview = dynamic(() => import('./MarkdownPreview'), { ssr: false });

export const WikiPageView: React.FC = () => {
  const { selectedPage, isLocked, handleSavePage, handleDeletePage, setSelectedPage } = useWikiContext();
  const [isEditing, setIsEditing] = useState(false);

  if (!selectedPage) return null;

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
          onSave={(content, restrictedSections) => handleSavePage({ ...selectedPage, content, restrictedSections })}
          isLocked={isLocked}
          restrictedSections={selectedPage.restrictedSections}
          onDelete={() => handleDeletePage(selectedPage.id)}
          onClose={() => setSelectedPage(null)}
        />
      ) : (
        <MarkdownPreview content={renderPageContent(selectedPage.content, selectedPage.restrictedSections)} />
      )}
    </>
  );
};
