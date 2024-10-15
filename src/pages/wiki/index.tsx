"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { WikiHeader } from '@/components/WikiHeader';
import { WikiSearch } from '@/components/WikiSearch';
import { WikiCardGrid } from '@/components/WikiCardGrid';
import { AddNewPageDialog } from '@/components/AddNewPageDialog';
import { TracingBeam } from "@/components/ui/tracing-beam";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

// Types
export interface WikiPage {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  subCategory: string;
  restricted?: boolean;
  secretSections?: { start: number; end: number }[];
}

const WikiPage: React.FC = () => {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isAddingPage, setIsAddingPage] = useState<boolean>(false);

  useEffect(() => {
    // Initialize pages here to avoid hydration mismatch
    setPages([
      { id: 1, title: 'Getting Started', content: '# Getting Started\n\nLearn how to use our wiki system...', excerpt: 'Learn how to use our wiki system...', category: 'General', subCategory: 'Introduction' },
      { id: 2, title: 'Company Policies', content: '# Company Policies\n\nFind information about our company policies...', excerpt: 'Find information about our company policies...', category: 'HR', subCategory: 'Policies' },
      { id: 3, title: 'Project Guidelines', content: '# Project Guidelines\n\nBest practices for managing projects...', excerpt: 'Best practices for managing projects...', category: 'Project Management', subCategory: 'Guidelines' },
      { id: 4, title: 'Security Protocols', content: '# Security Protocols\n\nImportant security information...', excerpt: 'Important security information...', category: 'IT', subCategory: 'Security', restricted: true, secretSections: [{ start: 2, end: 4 }] },
      { id: 5, title: 'Onboarding Process', content: '# Onboarding Process\n\nSteps for onboarding new team members...', excerpt: 'Steps for onboarding new team members...', category: 'HR', subCategory: 'Onboarding' },
      { id: 6, title: 'Product Roadmap', content: '# Product Roadmap\n\nOur product vision and upcoming features...', excerpt: 'Our product vision and upcoming features...', category: 'Product', subCategory: 'Planning' },
    ]);
  }, []);

  const categories = useMemo(() => ['All', ...new Set(pages.map(page => page.category))], [pages]);
  const allSubCategories = useMemo(() => [...new Set(pages.map(page => page.subCategory))], [pages]);

  const filteredPages = useMemo(() => {
    return pages.filter(page =>
      (selectedCategory === 'All' || page.category === selectedCategory) &&
      (selectedSubCategories.length === 0 || selectedSubCategories.includes(page.subCategory)) &&
      (fuzzySearch(page.title, searchTerm) || fuzzySearch(page.content, searchTerm)) &&
      (!page.restricted || !isLocked)
    );
  }, [pages, selectedCategory, selectedSubCategories, searchTerm, isLocked]);

  const handleSavePage = (updatedPage: WikiPage) => {
    setPages(prevPages => prevPages.map(page => page.id === updatedPage.id ? updatedPage : page));
  };

  const handleDeletePage = (pageId: number) => {
    setPages(prevPages => prevPages.filter(page => page.id !== pageId));
  };

  const handleAddPage = (newPage: Omit<WikiPage, 'id'>) => {
    const newId = Math.max(...pages.map(page => page.id)) + 1;
    setPages(prevPages => [...prevPages, { ...newPage, id: newId }]);
    setIsAddingPage(false);
  };

  return (
    <div className="min-h-screen bg-background overflow-y-auto scrollbar-hide">
      <WikiHeader isLocked={isLocked} setIsLocked={setIsLocked} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wiki Pages</h1>
          <Button onClick={() => setIsAddingPage(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Page
          </Button>
        </div>
        <WikiSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          subCategories={allSubCategories}
          selectedSubCategories={selectedSubCategories}
          setSelectedSubCategories={setSelectedSubCategories}
        />
        <WikiCardGrid
          pages={filteredPages}
          isLocked={isLocked}
          onSavePage={handleSavePage}
          onDeletePage={handleDeletePage}
        />
        {filteredPages.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No articles found. Try adjusting your search, category, or sub-categories.</p>
        )}
        <AddNewPageDialog
          isOpen={isAddingPage}
          onClose={() => setIsAddingPage(false)}
          onAddPage={handleAddPage}
          categories={categories.filter(cat => cat !== 'All')}
          subCategories={allSubCategories}
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
