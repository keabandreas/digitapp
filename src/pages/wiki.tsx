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
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="flex-shrink-0 container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">DigiDB</h1>
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
      </div>
      <div className="flex-grow flex overflow-hidden">
        <div className={`overflow-y-auto ${selectedPage ? 'w-1/2' : 'w-full'}`}>
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
  );
};

export default function WikiPage() {
  return (
    <WikiProvider>
      <WikiPageContent />
    </WikiProvider>
  );
}