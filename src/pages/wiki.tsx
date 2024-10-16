'use client'

import React from 'react';
import { WikiProvider, useWikiContext } from '@/components/wiki/WikiContext';
import { WikiSearch } from '@/components/wiki/WikiSearch';
import { WikiDirectoryTree } from '@/components/wiki/WikiDirectoryTree';
import { WikiPageView } from '@/components/wiki/WikiPageView';
import { AddNewPageDialog } from '@/components/wiki/AddNewPageDialog';
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Lock, Unlock, PlusCircle } from "lucide-react";

const WikiPageContent = () => {
  const {
    isLocked,
    handleLockToggle,
    isAddingPage,
    setIsAddingPage,
    selectedPage,
  } = useWikiContext();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wiki Pages</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>{isLocked ? <Lock className="text-red-500" /> : <Unlock className="text-green-500" />}</span>
              <Switch checked={!isLocked} onCheckedChange={handleLockToggle} />
            </div>
            <Button onClick={() => setIsAddingPage(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Page
            </Button>
          </div>
        </div>
        <WikiSearch />
        <div className="flex mt-6 h-[calc(100vh-200px)]">
          <div className={`overflow-y-auto ${selectedPage ? 'w-1/2 pr-4' : 'w-full'}`}>
            <WikiDirectoryTree />
          </div>
          {selectedPage && (
            <div className="w-1/2 pl-4 border-l overflow-y-auto">
              <WikiPageView />
            </div>
          )}
        </div>
        <AddNewPageDialog isOpen={isAddingPage} onClose={() => setIsAddingPage(false)} />
      </div>
    </div>
  );
};

export default function WikiPage() {
  return (
    <WikiProvider>
      <WikiPageContent />
    </WikiProvider>
  );
}
