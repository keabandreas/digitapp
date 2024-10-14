import React from 'react';
import { WikiCard } from './WikiCard';
import { WikiPage } from '../pages/wiki/index';

interface WikiCardGridProps {
  pages: WikiPage[];
  isLocked: boolean;
  onSavePage: (updatedPage: WikiPage) => void;
}

export const WikiCardGrid: React.FC<WikiCardGridProps> = ({ pages, isLocked, onSavePage }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map(page => (
        <WikiCard key={page.id} page={page} isLocked={isLocked} onSavePage={onSavePage} />
      ))}
    </div>
  );
};
