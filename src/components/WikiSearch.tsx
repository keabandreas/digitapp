import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WikiSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  subCategories: string[];
  selectedSubCategories: string[];
  setSelectedSubCategories: (subCategories: string[]) => void;
}

export const WikiSearch: React.FC<WikiSearchProps> = ({
  searchTerm,
  setSearchTerm,
  categories,
  selectedCategory,
  setSelectedCategory,
  subCategories,
  selectedSubCategories,
  setSelectedSubCategories,
}) => {
  const toggleSubCategory = (subCategory: string) => {
    setSelectedSubCategories(prevSubCategories =>
      prevSubCategories.includes(subCategory)
        ? prevSubCategories.filter(sc => sc !== subCategory)
        : [...prevSubCategories, subCategory]
    );
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2">
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
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Sub-Categories</h3>
        <div className="flex flex-wrap gap-2">
          {subCategories.map(subCategory => (
            <Button
              key={subCategory}
              variant={selectedSubCategories.includes(subCategory) ? "default" : "outline"}
              onClick={() => toggleSubCategory(subCategory)}
            >
              {subCategory}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
