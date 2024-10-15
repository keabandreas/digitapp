"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WikiSearch } from '@/components/WikiSearch';
import { WikiDirectoryTree } from '@/components/WikiDirectoryTree';
import { AddNewPageDialog } from '@/components/AddNewPageDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Lock, Unlock, Edit, X, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import dynamic from 'next/dynamic';
import { Trash2 } from 'lucide-react';

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), { ssr: false });
const MarkdownPreview = dynamic(() => import('@/components/MarkdownPreview'), { ssr: false });

// Types
export interface WikiPage {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  subCategory: string;
  restrictedSections?: { start: number; end: number }[];
}

const WikiPage: React.FC = () => {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isAddingPage, setIsAddingPage] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchResults, setSearchResults] = useState<WikiPage[]>([]);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState<number>(-1);
  const [previewPage, setPreviewPage] = useState<WikiPage | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const response = await fetch('/api/wiki/pages');
        if (response.ok) {
          const loadedPages = await response.json();
          setPages(loadedPages);
        } else {
          console.error('Failed to load wiki pages');
        }
      } catch (error) {
        console.error('Error loading wiki pages:', error);
      }
    };

    loadPages();
  }, []);

  const categories = useMemo(() => ['General', 'HR', 'Project Management', 'IT', 'Product'], []);
  const subCategories = useMemo(() => ['Introduction', 'Policies', 'Guidelines', 'Security', 'Onboarding', 'Planning'], []);

  const filteredPages = useMemo(() => pages, [pages]);

  useEffect(() => {
    const results = pages.filter(page =>
      fuzzySearch(page.title, searchTerm) || fuzzySearch(page.content, searchTerm)
    );
    setSearchResults(results);
    setSelectedSearchIndex(-1);
    setPreviewPage(null);
    setIsSearchOpen(searchTerm.length > 0);
  }, [searchTerm, pages]);

  const handleSavePage = async (updatedPage: WikiPage) => {
    try {
      const response = await fetch(`/api/wiki/pages/${updatedPage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPage),
      });

      if (response.ok) {
        setPages(prevPages => prevPages.map(page => page.id === updatedPage.id ? updatedPage : page));
        setSelectedPage(updatedPage);
        setIsEditing(false);
      } else {
        console.error('Failed to save wiki page');
      }
    } catch (error) {
      console.error('Error saving wiki page:', error);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/wiki/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPages(prevPages => prevPages.filter(page => page.id !== pageId));
        setSelectedPage(null);
      } else {
        console.error('Failed to delete wiki page');
      }
    } catch (error) {
      console.error('Error deleting wiki page:', error);
    }
  };

  const handleAddPage = async (newPage: Omit<WikiPage, 'id'>) => {
    try {
      const response = await fetch('/api/wiki/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPage),
      });

      if (response.ok) {
        const createdPage = await response.json();
        setPages(prevPages => [...prevPages, createdPage]);
        setIsAddingPage(false);
      } else {
        console.error('Failed to add new wiki page');
      }
    } catch (error) {
      console.error('Error adding new wiki page:', error);
    }
  };

  const handleLockToggle = async () => {
    if (isLocked) {
      const enteredPassword = prompt('Enter password to unlock:');
      if (enteredPassword) {
        try {
          const response = await fetch('/api/verify-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: enteredPassword }),
          });

          if (response.ok) {
            setIsLocked(false);
          } else {
            const errorData = await response.json();
            alert(errorData.message || 'Incorrect password');
          }
        } catch (error) {
          console.error('Error verifying password:', error);
          alert('An error occurred while verifying the password');
        }
      }
    } else {
      setIsLocked(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSearchIndex(prev => {
        const newIndex = Math.min(prev + 1, searchResults.length - 1);
        setPreviewPage(searchResults[newIndex]);
        return newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSearchIndex(prev => {
        const newIndex = Math.max(prev - 1, 0);
        setPreviewPage(searchResults[newIndex]);
        return newIndex;
      });
    } else if (e.key === 'Enter' && selectedSearchIndex >= 0) {
      e.preventDefault();
      setSelectedPage(searchResults[selectedSearchIndex]);
      setSearchTerm('');
      setPreviewPage(null);
      setIsSearchOpen(false);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    if (searchResultsRef.current && selectedSearchIndex >= 0) {
      const selectedElement = searchResultsRef.current.children[selectedSearchIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedSearchIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wiki Pages</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>{isLocked ? <Lock className="text-red-500" /> : <Unlock className="text-green-500" />}</span>
              <Switch checked={!isLocked} onCheckedChange={handleLockToggle} />
            </div>
            <Button onClick={() => setIsAddingPage(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Page
            </Button>
          </div>
        </div>
        <div className="relative" ref={searchInputRef}>
          <WikiSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onKeyDown={handleKeyDown}
          />
          {isSearchOpen && (
            <div className="flex">
              <div 
                ref={searchResultsRef}
                className="absolute z-10 mt-1 w-1/2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {searchResults.map((page, index) => (
                  <div
                    key={page.id}
                    className={`p-2 hover:bg-gray-100 cursor-pointer ${index === selectedSearchIndex ? 'bg-gray-200' : ''}`}
                    onClick={() => {
                      setSelectedPage(page);
                      setSearchTerm('');
                      setPreviewPage(null);
                      setIsSearchOpen(false);
                    }}
                    onMouseEnter={() => setPreviewPage(page)}
                  >
                    {page.title}
                  </div>
                ))}
              </div>
              {previewPage && (
                <div className="absolute z-10 mt-1 left-1/2 w-1/2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto p-4">
                  <h3 className="text-lg font-semibold mb-2">{previewPage.title}</h3>
                  <MarkdownPreview content={renderPageContent(previewPage.content.slice(0, 200) + '...', previewPage.restrictedSections)} />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex mt-6 h-[calc(100vh-200px)]">
          <div className={`overflow-y-auto ${selectedPage ? 'w-1/2 pr-4' : 'w-full'}`}>
            <WikiDirectoryTree
              pages={filteredPages}
              isLocked={isLocked}
              onSavePage={handleSavePage}
              onDeletePage={handleDeletePage}
              categories={categories}
              subCategories={subCategories}
              onSelectPage={setSelectedPage}
            />
          </div>
          {selectedPage && (
            <div className="w-1/2 pl-4 border-l overflow-y-auto">
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
                    {isEditing && (
                      <DropdownMenuItem onClick={() => handleSavePage(selectedPage)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Save
                      </DropdownMenuItem>
                    )}
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
            </div>
          )}
        </div>
        {filteredPages.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No articles found. Try adjusting your search.</p>
        )}
        <AddNewPageDialog
          isOpen={isAddingPage}
          onClose={() => setIsAddingPage(false)}
          onAddPage={handleAddPage}
          categories={categories}
          subCategories={subCategories}
        />
      </div>
    </div>
  );
};

// Improved fuzzy search function
const fuzzySearch = (str: string, pattern: string): boolean => {
  const string = str.toLowerCase();
  const search = pattern.toLowerCase();
  let j = 0;
  for (let i = 0; i < string.length && j < search.length; i++) {
    if (string[i] === search[j]) {
      j++;
    }
  }
  return j === search.length;
};

export default WikiPage;
