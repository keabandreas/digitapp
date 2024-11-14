// @/lib/hooks/useSearch.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Document } from '@/lib/types/wiki';
import Fuse from 'fuse.js';

export const useSearch = (documents: Document[]) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Fuse.FuseResult<Document>[]>([]);

  // Enhanced Fuse configuration
  const searchIndex = useMemo(() => {
    return new Fuse(documents, {
      keys: [
        { 
          name: 'title',
          weight: 3.0  // Increased weight for titles
        },
        {
          name: 'content',
          weight: 1.0
        },
        {
          name: 'category',
          weight: 2.0
        }
      ],
      includeMatches: true,
      shouldSort: true,
      threshold: 0.3,      // Lower threshold for stricter matching
      location: 0,         // Start searching at beginning of strings
      distance: 200,       // Allow more distance for matches
      minMatchCharLength: 2,  // Minimum length for matches
      useExtendedSearch: true,
      ignoreLocation: false,  // Consider location in string for relevance
      findAllMatches: true,   // Find all matching instances
      // Add Swedish diacritics to equivalent chars
      getFn: (obj, path) => {
        const value = Fuse.config.getFn(obj, path);
        if (typeof value === 'string') {
          return value.toLowerCase()
            .replace(/[åä]/g, 'a')
            .replace(/ö/g, 'o');
        }
        return value;
      }
    });
  }, [documents]);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      if (e.key === 'Escape' && isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(false);
        setSearchResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Use extended search syntax for better matching
    const searchPattern = query.split(' ').map(term => {
      // Exact match for terms with quotes
      if (term.startsWith('"') && term.endsWith('"')) {
        return `'${term.slice(1, -1)}`;
      }
      // Fuzzy matching for other terms
      return `${term}`;
    }).join(' ');

    const results = searchIndex.search(searchPattern);
    setSearchResults(results);
  }, [searchIndex]);

  // Add a cleanup function for when the search modal is closed
  const handleClose = useCallback(() => {
    setIsSearchOpen(false);
    setSearchResults([]);
  }, []);

  return {
    isSearchOpen,
    setIsSearchOpen,
    searchResults,
    setSearchResults,
    handleSearch,
    handleClose
  };
};

// Add type exports if needed
export type SearchResult = Fuse.FuseResult<Document>;