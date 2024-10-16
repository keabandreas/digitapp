'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  subCategory: string;
  restrictedSections?: { start: number; end: number }[];
}

interface WikiContextType {
  pages: WikiPage[];
  setPages: React.Dispatch<React.SetStateAction<WikiPage[]>>;
  selectedPage: WikiPage | null;
  setSelectedPage: React.Dispatch<React.SetStateAction<WikiPage | null>>;
  isLocked: boolean;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
  isAddingPage: boolean;
  setIsAddingPage: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleLockToggle: () => Promise<void>;
  handleSavePage: (updatedPage: WikiPage) => Promise<void>;
  handleDeletePage: (pageId: string) => Promise<void>;
  handleAddPage: (newPage: Omit<WikiPage, 'id'>) => Promise<void>;
}

const WikiContext = createContext<WikiContextType | undefined>(undefined);

export const WikiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isAddingPage, setIsAddingPage] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  const value = {
    pages,
    setPages,
    selectedPage,
    setSelectedPage,
    isLocked,
    setIsLocked,
    isAddingPage,
    setIsAddingPage,
    searchTerm,
    setSearchTerm,
    handleLockToggle,
    handleSavePage,
    handleDeletePage,
    handleAddPage,
  };

  return <WikiContext.Provider value={value}>{children}</WikiContext.Provider>;
};

export const useWikiContext = () => {
  const context = useContext(WikiContext);
  if (context === undefined) {
    throw new Error('useWikiContext must be used within a WikiProvider');
  }
  return context;
};
