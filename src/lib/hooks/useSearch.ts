// @/lib/hooks/useSearch.ts
import { useState, useCallback, useMemo } from 'react';
import { Document } from '@/lib/types/wiki';
import { createSearchIndex, searchDocuments } from '@/lib/search';

export const useSearch = (documents: Document[]) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  
  // Create search index whenever documents change
  const searchIndex = useMemo(() => createSearchIndex(documents), [documents]);

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      const results = searchDocuments(searchIndex, query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchIndex]);

  return {
    isSearchOpen,
    setIsSearchOpen,
    searchResults,
    setSearchResults,
    handleSearch
  };
};