"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { WikiHeader } from '@/components/WikiHeader';
import { WikiSearch } from '@/components/WikiSearch';
import { WikiCardGrid } from '@/components/WikiCardGrid';
import { TracingBeam } from "@/components/ui/tracing-beam";

// Types
export interface WikiPage {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  restricted?: boolean;
}

const WikiPage: React.FC = () => {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLocked, setIsLocked] = useState<boolean>(true);

  useEffect(() => {
    // Initialize pages here to avoid hydration mismatch
    setPages([
      { id: 1, title: 'Getting Started', content: '# Getting Started\n\nLearn how to use our wiki system...', excerpt: 'Learn how to use our wiki system...', category: 'General' },
      { id: 2, title: 'Company Policies', content: '# Company Policies\n\nFind information about our company policies...', excerpt: 'Find information about our company policies...', category: 'HR' },
      { id: 3, title: 'Project Guidelines', content: '# Project Guidelines\n\nBest practices for managing projects...', excerpt: 'Best practices for managing projects...', category: 'Project Management' },
      { id: 4, title: 'Security Protocols', content: '# Security Protocols\n\nImportant security information...', excerpt: 'Important security information...', category: 'IT', restricted: true },
      { id: 5, title: 'Onboarding Process', content: '# Onboarding Process\n\nSteps for onboarding new team members...', excerpt: 'Steps for onboarding new team members...', category: 'HR' },
      { id: 6, title: 'Product Roadmap', content: '# Product Roadmap\n\nOur product vision and upcoming features...', excerpt: 'Our product vision and upcoming features...', category: 'Product' },
    ]);
  }, []);

  const categories = useMemo(() => ['All', ...new Set(pages.map(page => page.category))], [pages]);

  const filteredPages = useMemo(() => {
    return pages.filter(page =>
      (selectedCategory === 'All' || page.category === selectedCategory) &&
      (fuzzySearch(page.title, searchTerm) || fuzzySearch(page.excerpt, searchTerm)) &&
      (!page.restricted || !isLocked)
    );
  }, [pages, selectedCategory, searchTerm, isLocked]);

  const handleSavePage = (updatedPage: WikiPage) => {
    setPages(prevPages => prevPages.map(page => page.id === updatedPage.id ? updatedPage : page));
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="flex-1 relative">
        <TracingBeam className="absolute inset-0">
          <div className="h-full overflow-y-scroll scrollbar-hide">
            <WikiHeader isLocked={isLocked} setIsLocked={setIsLocked} />
            <div className="container mx-auto p-4">
              <WikiSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
              <WikiCardGrid
                pages={filteredPages}
                isLocked={isLocked}
                onSavePage={handleSavePage}
              />
              {filteredPages.length === 0 && (
                <p className="text-center text-gray-500 mt-8">No articles found. Try adjusting your search or category.</p>
              )}
            </div>
          </div>
        </TracingBeam>
      </div>
    </div>
  );
};

// Simple fuzzy search function
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
