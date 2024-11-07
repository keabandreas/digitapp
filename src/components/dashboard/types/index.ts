import { ReactNode } from 'react';

export interface CommandItem {
  id: string;
  name: string;
  description?: string;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings' | 'scripts' | 'functions';
  tags?: string[];
  path?: string;
  module?: string;
}

export interface BentoItem {
  title: string;
  description: string;
  icon: ReactNode;
  className: string;
  component: ReactNode;
  hoverColor: string;
}