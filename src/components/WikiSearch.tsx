import React from 'react';
import { Input } from '@/components/ui/input';

interface WikiSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const WikiSearch: React.FC<WikiSearchProps> = ({
  searchTerm,
  setSearchTerm,
  onKeyDown,
}) => {
  return (
    <div className="mb-8">
      <Input
        type="text"
        placeholder="Search pages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full"
      />
    </div>
  );
};
