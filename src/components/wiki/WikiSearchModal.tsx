import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import FocusLock from 'react-focus-lock';
import { cn } from "@/lib/utils";

interface SearchResult {
  item: {
    id: number;
    title: string;
    content: string;
    category: string;
  };
  matches: Array<{
    key: string;
    value: string;
    indices: number[][];
  }>;
  score: number;
}

interface WikiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: SearchResult[];
  onResultSelect: (id: number) => void;
  expandToDocument?: (id: number) => void;
  onSearch: (query: string) => void;
}

export default function WikiSearchModal({
  isOpen,
  onClose,
  searchResults,
  onResultSelect,
  expandToDocument,
  onSearch
}: WikiSearchModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setSelectedIndex(0);
      searchRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    e.stopPropagation();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          (prev + 1) % Math.min(searchResults.length, 10)
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev === 0 ? Math.min(searchResults.length - 1, 9) : prev - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (searchResults.length > 0 && selectedIndex >= 0) {
          const result = searchResults[selectedIndex];
          if (result) {
            onResultSelect(result.item.id);
            expandToDocument?.(result.item.id);
            onClose();
          }
        }
        break;

      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
      return () => window.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isOpen, searchResults.length, selectedIndex]);

  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch(value);
    setSelectedIndex(0);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const highlightMatches = (text: string, indices: number[][]) => {
    let result = [];
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
      if (start > lastIndex) {
        result.push(<span key={`text-${start}`}>{text.slice(lastIndex, start)}</span>);
      }
      result.push(
        <span key={`highlight-${start}`} className="bg-yellow-200 text-black font-medium">
          {text.slice(start, end + 1)}
        </span>
      );
      lastIndex = end + 1;
    });

    if (lastIndex < text.length) {
      result.push(<span key={`text-end`}>{text.slice(lastIndex)}</span>);
    }

    return result;
  };

  const getMatchContext = (content: string, indices: number[][]) => {
    const CONTEXT_SIZE = 40;
    const MAX_SNIPPETS = 3;

    let snippets: { text: string; indices: number[][] }[] = [];
    
    indices.sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < indices.length && snippets.length < MAX_SNIPPETS; i++) {
      const [start, end] = indices[i];
      const snippetStart = Math.max(0, start - CONTEXT_SIZE);
      const snippetEnd = Math.min(content.length, end + CONTEXT_SIZE);
      
      let snippet = content.slice(snippetStart, snippetEnd);
      
      if (snippetStart > 0) snippet = '...' + snippet;
      if (snippetEnd < content.length) snippet = snippet + '...';
      
      snippets.push({
        text: snippet,
        indices: [[
          start - snippetStart + (snippetStart > 0 ? 3 : 0),
          end - snippetStart + (snippetStart > 0 ? 3 : 0)
        ]]
      });
    }

    return snippets;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          <FocusLock returnFocus>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="w-full max-w-3xl mx-4 bg-background rounded-xl shadow-2xl overflow-hidden"
              onClick={stopPropagation}
            >
              <div className="p-6 border-b">
                <div className="relative">
                  <Input
                    ref={searchRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Search documents..."
                    className="pl-12 py-6 text-lg"
                    autoFocus
                  />
                  <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div 
                ref={resultsRef}
                className="max-h-[60vh] overflow-y-auto"
              >
                {searchResults.length === 0 && inputValue.trim() !== '' && (
                  <div className="p-8 text-center text-lg text-muted-foreground">
                    No results found
                  </div>
                )}
                {searchResults.slice(0, 10).map((result, index) => (
                  <div
                    key={result.item.id}
                    className={cn(
                      "border-b last:border-b-0 hover:bg-muted/50 cursor-pointer p-6",
                      selectedIndex === index && "bg-muted"
                    )}
                    onClick={() => {
                      onResultSelect(result.item.id);
                      expandToDocument?.(result.item.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="text-lg font-medium">
                        {result.matches.find(m => m.key === 'title')
                          ? highlightMatches(
                              result.item.title,
                              result.matches.find(m => m.key === 'title')!.indices
                            )
                          : result.item.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {result.item.category}
                      </span>
                    </div>
                    {result.matches.find(m => m.key === 'content') && (
                      <div className="text-base text-muted-foreground space-y-2 ml-8">
                        {getMatchContext(
                          result.item.content,
                          result.matches.find(m => m.key === 'content')!.indices
                        ).map((snippet, i) => (
                          <div key={i}>
                            {highlightMatches(snippet.text, snippet.indices)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {searchResults.length > 10 && (
                  <div className="p-4 text-center text-base text-muted-foreground">
                    {searchResults.length - 10} more results...
                  </div>
                )}
              </div>
            </motion.div>
          </FocusLock>
        </motion.div>
      )}
    </AnimatePresence>
  );
}