import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, Key, Book, Scroll, Ruler, Rocket, Calendar } from 'lucide-react';
import { useWikiContext, WikiPage } from './WikiContext';
import { wikiConfig } from './WikiConfig';

export const WikiDirectoryTree: React.FC = () => {
  const { pages, isLocked, setSelectedPage } = useWikiContext();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const groupedPages = pages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, WikiPage[]>);

  const getSubCategoryIcon = (subCategory: string) => {
    switch (subCategory.toLowerCase()) {
      case 'introduction': return <Book size={16} />;
      case 'policies': return <Scroll size={16} />;
      case 'guidelines': return <Ruler size={16} />;
      case 'security': return <Key size={16} />;
      case 'onboarding': return <Rocket size={16} />;
      case 'planning': return <Calendar size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-4">
      {wikiConfig.categories.map((category) => (
        <div key={category} className="border rounded-lg p-2">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            {expandedCategories.includes(category) ? <ChevronDown className="mr-2" /> : <ChevronRight className="mr-2" />}
            <Folder className="mr-2" />
            <span className="font-semibold">{category}</span>
          </div>
          {expandedCategories.includes(category) && groupedPages[category] && (
            <div className="mt-2 space-y-2">
              {groupedPages[category].map(page => (
                <div
                  key={page.id}
                  className={`flex items-center justify-between cursor-pointer hover:bg-gray-100 p-2 rounded border ${
                    isLocked && page.isRestricted ? 'opacity-50' : ''
                  }`}
                  onClick={() => !isLocked || !page.isRestricted ? setSelectedPage(page) : null}
                >
                  <div className="flex items-center">
                    <FileText className="mr-2" size={16} />
                    <span>{page.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSubCategoryIcon(page.subCategory)}
                    {page.isRestricted && <Key className="text-purple-500" size={16} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
