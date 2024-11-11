// src/components/wiki/WikiSearch.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

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

interface WikiSearchProps {
  onSearch: (value: string) => void;
  searchResults: SearchResult[];
  onResultSelect: (id: number) => void;
  className?: string;
}

export default function WikiSearch({ onSearch, searchResults, onResultSelect, className }: WikiSearchProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to highlight matched text
  const highlightMatches = (text: string, indices: number[][]) => {
    let result = [];
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
      // Add text before match
      if (start > lastIndex) {
        result.push(<span key={`text-${start}`}>{text.slice(lastIndex, start)}</span>);
      }
      // Add highlighted match
      result.push(
        <span key={`highlight-${start}`} className="bg-yellow-200 text-black font-medium">
          {text.slice(start, end + 1)}
        </span>
      );
      lastIndex = end + 1;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(<span key={`text-end`}>{text.slice(lastIndex)}</span>);
    }

    return result;
  };

  // Get focused context around matches
  const getMatchContext = (content: string, indices: number[][]) => {
    const CONTEXT_SIZE = 40;  // Characters of context on each side
    const MAX_SNIPPETS = 3;   // Maximum number of snippets to show
    const MIN_GAP = 80;       // Minimum gap between snippets to show them separately

    // Sort indices by start position
    indices.sort((a, b) => a[0] - b[0]);

    let snippets: { text: string; indices: number[][] }[] = [];
    let currentSnippet = {
      start: 0,
      end: 0,
      indices: [[0, 0]],
    };

    indices.forEach((match, idx) => {
      const [start, end] = match;
      
      if (idx === 0) {
        currentSnippet = {
          start: Math.max(0, start - CONTEXT_SIZE),
          end: Math.min(content.length, end + CONTEXT_SIZE),
          indices: [match],
        };
      } else {
        // If this match is close to the previous one, extend the current snippet
        if (start - currentSnippet.end < MIN_GAP) {
          currentSnippet.end = Math.min(content.length, end + CONTEXT_SIZE);
          currentSnippet.indices.push(match);
        } else {
          // Add the current snippet and start a new one
          snippets.push({
            text: content.slice(currentSnippet.start, currentSnippet.end),
            indices: currentSnippet.indices.map(([s, e]) => [
              s - currentSnippet.start,
              e - currentSnippet.start,
            ]),
          });

          if (snippets.length >= MAX_SNIPPETS) return;

          currentSnippet = {
            start: Math.max(0, start - CONTEXT_SIZE),
            end: Math.min(content.length, end + CONTEXT_SIZE),
            indices: [match],
          };
        }
      }
    });

    // Add the last snippet if we haven't reached the maximum
    if (snippets.length < MAX_SNIPPETS) {
      snippets.push({
        text: content.slice(currentSnippet.start, currentSnippet.end),
        indices: currentSnippet.indices.map(([s, e]) => [
          s - currentSnippet.start,
          e - currentSnippet.start,
        ]),
      });
    }

    // Add ellipsis where needed
    return snippets.map((snippet, i) => ({
      text: (i > 0 ? '... ' : '') + snippet.text + (i < snippets.length - 1 ? ' ...' : ''),
      indices: snippet.indices.map(([s, e]) => [
        s + (i > 0 ? 4 : 0),
        e + (i > 0 ? 4 : 0),
      ]),
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch(value);
    setIsOpen(true);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        ref={searchRef}
        type="text"
        value={inputValue}
        placeholder="Search documents... (Ctrl + Space)"
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="pl-10"
      />
      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && inputValue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-[60vh] overflow-y-auto">
              {searchResults.slice(0, 10).map((result) => (
                <div
                  key={result.item.id}
                  className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    onResultSelect(result.item.id);
                    setIsOpen(false);
                    setInputValue('');
                  }}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {result.matches.find(m => m.key === 'title')
                          ? highlightMatches(
                              result.item.title,
                              result.matches.find(m => m.key === 'title')!.indices
                            )
                          : result.item.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {result.item.category}
                      </span>
                    </div>
                    {result.matches.find(m => m.key === 'content') && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {getMatchContext(
                          result.item.content,
                          result.matches.find(m => m.key === 'content')!.indices
                        ).map((snippet, i) => (
                          <div key={i} className="font-mono">
                            {highlightMatches(snippet.text, snippet.indices)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {searchResults.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  {searchResults.length - 10} more results...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}