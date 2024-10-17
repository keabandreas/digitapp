import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWikiContext, WikiPage } from './WikiContext';
import MarkdownPreview from './MarkdownPreview';

export const WikiSearch: React.FC = () => {
  const { pages, setSelectedPage } = useWikiContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<WikiPage[]>([]);
  const [previewPage, setPreviewPage] = useState<WikiPage | null>(null);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const results = pages.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, pages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already performed in the useEffect hook
  };

  const handleResultClick = (page: WikiPage) => {
    setSelectedPage(page);
  };

  const handlePreview = (page: WikiPage) => {
    setPreviewPage(page);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search wiki..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Search Results:</h3>
          <ul className="space-y-1">
            {searchResults.map(page => (
              <li key={page.id} className="flex justify-between items-center">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => handleResultClick(page)}
                >
                  {page.title}
                </span>
                <Button variant="outline" size="sm" onClick={() => handlePreview(page)}>
                  Preview
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {previewPage && (
        <div className="mt-4 p-4 border rounded">
          <h4 className="text-md font-semibold mb-2">{previewPage.title}</h4>
          <MarkdownPreview
            content={previewPage.content.slice(0, 200) + '...'}
            isRestricted={previewPage.isRestricted}
          />
        </div>
      )}
    </div>
  );
};
