import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useWikiContext } from './WikiContext';
import MarkdownPreview from './MarkdownPreview';
import { WikiPage } from './WikiContext';

export const WikiSearch: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    pages,
    setSelectedPage,
    isLocked,
  } = useWikiContext();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<WikiPage[]>([]);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [previewPage, setPreviewPage] = useState<WikiPage | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const results = pages.filter(page =>
      fuzzySearch(page.title, searchTerm) || fuzzySearch(page.content, searchTerm)
    );
    setSearchResults(results);
    setSelectedSearchIndex(-1);
    setPreviewPage(null);
    setIsSearchOpen(searchTerm.length > 0);
  }, [searchTerm, pages]);

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
    <div className="relative" ref={searchInputRef}>
      <Input
        type="text"
        placeholder="Search pages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full mb-8"
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
