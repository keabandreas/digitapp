// src/components/wiki/WikiSearch.tsx
import { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useWiki } from '@/lib/context/WikiContext';
import { cn } from "@/lib/utils";

export default function WikiSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const { documents, selectDocument } = useWiki();

  // Handle keyboard shortcut
  export function WikiSearch({ onOpen }: { onOpen: () => void }) {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.code === 'Space') {
          e.preventDefault();
          onOpen();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onOpen]);

  // Search functionality
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const query = value.toLowerCase();
    const results = documents.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query) ||
      doc.category.toLowerCase().includes(query)
    );

    setSearchResults(results);
  };

  return (
    <div className="relative w-full">
      <Input
        ref={searchRef}
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search documents... (Ctrl + Space)"
        onFocus={() => setIsOpen(true)}
        className="pl-10 py-6 text-lg"
      />
      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-[60vh] overflow-y-auto">
              {searchResults.map((doc) => (
                <div
                  key={doc.id}
                  className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    selectDocument(doc.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{doc.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}