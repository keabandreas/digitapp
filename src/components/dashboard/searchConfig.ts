// @/components/dashboard/searchConfig.ts
import { CommandItem } from './types';

export const searchConfig = {
  fuseOptions: {
    keys: [
      { name: 'name', weight: 1 },
      { name: 'description', weight: 0.8 },
      { name: 'tags', weight: 0.5 },
      { name: 'module', weight: 0.3 },
      { name: 'path', weight: 0.3 }
    ],
    threshold: 0.3,
    distance: 100
  },
  
  baseCommands: [
    {
      id: 'host-apps',
      name: "Host Applications",
      description: "Manage and monitor your host applications",
      shortcut: "⌘ 1",
      category: 'navigation',
      tags: ['apps', 'manage', 'monitor']
    },
    {
      id: 'statistics',
      name: "Statistics",
      description: "View system statistics and analytics",
      shortcut: "⌘ 2",
      category: 'navigation',
      tags: ['stats', 'analytics', 'charts']
    },
    {
      id: 'wiki',
      name: "Documentation",
      description: "Access guides and documentation",
      shortcut: "⌘ 3",
      category: 'navigation',
      tags: ['docs', 'help', 'guides']
    }
  ] as const,

  categories: ['navigation', 'scripts', 'functions', 'settings'] as const,

  // Helper functions
  getFilteredCommands: (commands: CommandItem[], query: string, fuse: any) => {
    if (!query) return commands;
    const results = fuse.search(query);
    return results.map((result: { item: CommandItem }) => result.item);
  },

  // Recent commands handling
  getRecentCommands: () => {
    try {
      const saved = localStorage.getItem('recentCommands');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveRecentCommands: (commands: CommandItem[]) => {
    try {
      localStorage.setItem('recentCommands', JSON.stringify(commands));
    } catch (error) {
      console.error('Failed to save recent commands:', error);
    }
  }
};

export default searchConfig;