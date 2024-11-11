import { ReactNode } from 'react';

export interface CommandItem {
  id: string;
  name: string;
  description?: string;
  shortcut?: string;
  action: () => void;
  category: 'navigation';
}

export interface BentoItem {
  title: string;
  description: string;
  icon: ReactNode;
  className: string;
  component: ReactNode;
  hoverColor: string;
}