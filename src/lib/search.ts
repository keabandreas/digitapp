import Fuse from 'fuse.js';

export interface Document {
  id: number;
  title: string;
  content: string;
  restricted: boolean;
  category: string;
}

export function createSearchIndex(documents: Document[]) {
  return new Fuse(documents, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'content', weight: 1 },
      { name: 'category', weight: 0.5 }
    ],
    includeMatches: true,
    threshold: 0.4,           // More lenient matching
    minMatchCharLength: 1,    // Changed from 2 to 1 to allow single-character searches
    distance: 100,
    ignoreLocation: true,
    useExtendedSearch: true,
    findAllMatches: true      // Added to ensure we get all possible matches
  });
}

export function searchDocuments(searchIndex: Fuse<Document>, query: string) {
  if (!query) return [];
  
  return searchIndex.search(query);
}