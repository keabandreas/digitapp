// src/lib/types/wiki.ts
export interface Document {
  id: number;
  title: string;
  content: string;
  restricted: boolean;
  category: string;
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  order: number;
}

export interface CategoryWithHierarchy extends Category {
  level: number;
  children: CategoryWithHierarchy[];
  documentCount: number;
}

export interface DocumentUpdate {
  title?: string;
  content?: string;
  category?: string;
  restricted?: boolean;
  isPinned?: boolean;
}

export interface SearchResult {
  document: Document;
  matches: {
    indices: [number, number][];
    key: string;
    value: string;
  }[];
  score: number;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DocumentResponse extends ApiResponse<Document> {}
export interface DocumentsResponse extends ApiResponse<Document[]> {}
export interface CategoryResponse extends ApiResponse<Category> {}
export interface CategoriesResponse extends ApiResponse<Category[]> {}
export interface TagResponse extends ApiResponse<Tag> {}
export interface TagsResponse extends ApiResponse<Tag[]> {}

// Action Types for any reducers you might add later
export type DocumentAction = 
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: number }
  | { type: 'SET_SELECTED_DOCUMENT'; payload: Document | null }
  | { type: 'SET_IS_EDITING'; payload: boolean };

export type CategoryAction =
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: number }
  | { type: 'REORDER_CATEGORY'; payload: { id: number; order: number } };

export type TagAction =
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: number };

// State Types for context
export interface WikiState {
  documents: Document[];
  selectedDocument: Document | null;
  categories: CategoryWithHierarchy[];
  tags: Tag[];
  isEditing: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
}

// Additional Types for specific features
export interface DocumentFilter {
  category?: string;
  tag?: string;
  searchQuery?: string;
  restricted?: boolean;
  isPinned?: boolean;
}

export interface SortOption {
  field: keyof Document;
  direction: 'asc' | 'desc';
}

export interface DocumentStats {
  totalCount: number;
  restrictedCount: number;
  pinnedCount: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  lastUpdated: Date;
}