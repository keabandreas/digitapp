import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Lock, User } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Types
interface WikiPage {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  restricted?: boolean;
}

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

const WikiPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [pages, setPages] = useState<WikiPage[]>([
    { id: 1, title: 'Getting Started', excerpt: 'Learn how to use our wiki system...', category: 'General' },
    { id: 2, title: 'Company Policies', excerpt: 'Find information about our company policies...', category: 'HR' },
    { id: 3, title: 'Project Guidelines', excerpt: 'Best practices for managing projects...', category: 'Project Management' },
    { id: 4, title: 'Security Protocols', excerpt: 'Important security information...', category: 'IT', restricted: true },
    { id: 5, title: 'Onboarding Process', excerpt: 'Steps for onboarding new team members...', category: 'HR' },
    { id: 6, title: 'Product Roadmap', excerpt: 'Our product vision and upcoming features...', category: 'Product' },
  ]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => ['All', ...new Set(pages.map(page => page.category))], [pages]);

  const filteredPages = useMemo(() => {
    return pages.filter(page => 
      (selectedCategory === 'All' || page.category === selectedCategory) &&
      (fuzzySearch(page.title, searchTerm) || fuzzySearch(page.excerpt, searchTerm)) &&
      (!page.restricted || isAuthenticated)
    );
  }, [pages, selectedCategory, searchTerm, isAuthenticated]);

  const handleSignIn = () => {
    setIsAuthenticated(true);
    setUsername('Demo User');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">Company Wiki</h1>
        {isAuthenticated ? (
          <div className="flex items-center">
            <User className="mr-2" />
            <span className="mr-4">{username}</span>
            <Button onClick={handleSignOut}>Sign out</Button>
          </div>
        ) : (
          <Button onClick={handleSignIn}>Sign in</Button>
        )}
      </header>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map(page => (
          <Card key={page.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-700">{page.title}</h2>
                {page.restricted && <Lock className="text-yellow-500" />}
              </div>
              <span className="text-sm text-gray-500">{page.category}</span>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{page.excerpt}</p>
              <Link href={`/wiki/${page.id}`} passHref>
                <Button variant="link" className="text-blue-500 hover:text-blue-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read more
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No articles found. Try adjusting your search or category.</p>
      )}
    </div>
  );
};

export default WikiPage;
