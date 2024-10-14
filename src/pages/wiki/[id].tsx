"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import { Sidebar } from "@/components/ui/sidebar";
import { Lock, Unlock, HomeIcon, FileTextIcon, FolderIcon, SettingsIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface WikiPage {
  id: number;
  title: string;
  content: string;
  category: string;
  restricted?: boolean;
}

const WikiPageDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [page, setPage] = useState<WikiPage | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  useEffect(() => {
    // In a real application, you would fetch the page data from an API
    // This is just a mock-up
    const mockPage: WikiPage = {
      id: Number(id),
      title: 'Sample Wiki Page',
      content: '# Sample Wiki Page\n\nThis is a sample wiki page content.',
      category: 'General',
      restricted: false,
    };
    setPage(mockPage);
  }, [id]);

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

  const sidebarItems = [
    { name: "Home", icon: HomeIcon, link: "/" },
    { name: "All Pages", icon: FileTextIcon, link: "/wiki" },
    { name: "Categories", icon: FolderIcon, link: "#" },
    { name: "Settings", icon: SettingsIcon, link: "#" },
  ];

  if (!page) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">{page.title}</h1>
          <div className="flex items-center space-x-2">
            <span>{isLocked ? <Lock className="text-red-500" /> : <Unlock className="text-green-500" />}</span>
            <Switch checked={!isLocked} onCheckedChange={handleLockToggle} />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
          <div className="container mx-auto">
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WikiPageDetail;
