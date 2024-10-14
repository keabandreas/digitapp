"use client"

import React, { useState, useMemo } from 'react';
import { TracingBeam } from "@/components/ui/tracing-beam";
import { WikiHeader } from '@/components/WikiHeader';
import { WikiSearch } from '@/components/WikiSearch';
import { WikiCardGrid } from '@/components/WikiCardGrid';
import { Sidebar } from "@/components/ui/sidebar";
import { HomeIcon, FileTextIcon, FolderIcon, SettingsIcon } from 'lucide-react';

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
  const [pages, setPages] = useState<WikiPage[]>([
    { id: 1, title: 'Getting Started', content: '# Getting Started\n\nLearn how to use our wiki system...', excerpt: 'Learn how to use our wiki system...', category: 'General' },
    { id: 2, title: 'Company Policies', content: '# Company Policies\n\nFind information about our company policies...', excerpt: 'Find information about our company policies...', category: 'HR' },
    { id: 3, title: 'Project Guidelines', content: '# Project Guidelines\n\nBest practices for managing projects...', excerpt: 'Best practices for managing projects...', category: 'Project Management' },
    { id: 4, title: 'Security Protocols', content: '# Security Protocols\n\nImportant security information...', excerpt: 'Important security information...', category: 'IT', restricted: true },
    { id: 5, title: 'Onboarding Process', content: '# Onboarding Process\n\nSteps for onboarding new team members...', excerpt: 'Steps for onboarding new team members...', category: 'HR' },
    { id: 6, title: 'Product Roadmap', content: '# Product Roadmap\n\nOur product vision and upcoming features...', excerpt: 'Our product vision and upcoming features...', category: 'Product' },
  ]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLocked, setIsLocked] = useState<boolean>(true);

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

  const sidebarItems = [
    { name: "Home", icon: HomeIcon, link: "/" },
    { name: "All Pages", icon: FileTextIcon, link: "/wiki" },
    { name: "Categories", icon: FolderIcon, link: "#" },
    { name: "Settings", icon: SettingsIcon, link: "#" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <WikiHeader isLocked={isLocked} setIsLocked={setIsLocked} />
        <TracingBeam>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
            <div className="container mx-auto">
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
          </main>
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
